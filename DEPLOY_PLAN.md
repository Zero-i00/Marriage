# Production Deploy: Marriage (compose-prod + GitHub Actions + Caddy TLS)

## Context

Проект готовят к первому проду на домене **marriage.soft-stack.ru**. Есть только dev-инфра
(`docker-compose-*-local.yml`), но:

- Корневой `docker-compose-prod.yml` — пуст.
- `app/backend/docker-compose-prod.yml` — пуст; прод-Dockerfile у backend нет.
- `app/frontend/docker-compose-prod.yml` — **сломан** (копипаст bot: `bot`+`proxy`); прод-Dockerfile нет.
- `app/bot/docker-compose-prod.yml` — корректный (bot + sing-box proxy), прод-Dockerfile есть.
- Нет `.github/`, нет реверс-прокси, нет SSL.

Цель: прод-стек за Caddy c авто-TLS (Let's Encrypt), прод-Dockerfile'ы, рабочие prod-компоузы
в одной сети, CI/CD на GitHub Actions (lint/format + деплой по тегу через SSH со сборкой на
сервере). Плюс подробная инструкция `DEPLOY.md`.

## Принятые решения (уточнено у пользователя)

| Вопрос | Решение |
|--------|---------|
| Деплой | **SSH + сборка на сервере**: runner по SSH `git checkout <tag>` → `docker compose -f docker-compose-prod.yml up -d --build` |
| Триггер | **git-тег** `v*` (lint/format — на PR/push) |
| Домен | **Один домен, path `/api`**: `marriage.soft-stack.ru` → frontend; `/api/*` → backend |
| sing-box proxy | **Нужен**, `sing-box.json` рендерится на сервере из GH Secrets при деплое |
| env-шаблоны | **Только `.env.example`** (без `.env.prod.example`). Прод-значения инжектит workflow |
| Пути | `Caddyfile` → `caddy/`, скрипты → `deployment/` |

## Целевая архитектура

```
Браузер ──https──> Caddy (:80/:443, авто-TLS)
                     ├─ /api/*  ──> backend:8000   (root_path="/api", префикс НЕ стрипаем)
                     └─ /*      ──> frontend:3000  (next start, SSR)
Bot ──socks5──> proxy(sing-box) ──vless──> api.telegram.org
Bot ──http──> backend:8000/api  (напрямую по внутренней сети, минуя Caddy)
backend ──> db(postgres:16)
```

Все сервисы (`caddy, frontend, backend, db, bot, proxy`) — в одной сети `app-network`.
Prod-компоузы объединяются корневым `docker-compose-prod.yml` через `include:` — одноимённые
`app-network` мёржатся, сервисы резолвятся по имени.

**Про `/api`:** backend под `root_path="/api"` (Starlette стрипает префикс сам), поэтому и bot
(`SERVER_URL + /api`), и браузер зовут `.../api/...`; Caddy проксирует **без** `handle_path`-стрипа.

## Файлы: создать / изменить

### 1. Docker (прод-образы)

- **CREATE `app/backend/docker/prod/Dockerfile`** — как local, но `uv sync --no-dev`,
  non-root `USER appuser`, `ENTRYPOINT` на прод-entrypoint.
- **CREATE `app/backend/docker/prod/entrypoint.sh`** — `alembic upgrade head` → `exec uv run --no-sync src/main.py`
  (reload/echo сами выключатся при `APP_DEBUG=False`).
- **CREATE `app/frontend/docker/prod/Dockerfile`** — bun, single-stage: `bun install` →
  `ARG NEXT_PUBLIC_*` + `ENV` → `bun run build` → `bun run start` (порт 3000).
  `# ponytail: single-stage; multi-stage если размер образа станет важен`.
  NEXT_PUBLIC_* пекутся на build → передаём build-arg (env_file на build не влияет).
- `app/bot/docker/prod/Dockerfile` — **уже есть**, не трогаем.

### 2. Prod-компоузы

- **EDIT `app/backend/docker-compose-prod.yml`** — `backend` (prod Dockerfile, `env_file: .env`,
  `depends_on: db healthy`, **без** host-портов) + `db` (`postgres:16-alpine`, том `marriage-pg-data`,
  healthcheck, **без** host-порта), сеть `app-network`.
- **REWRITE `app/frontend/docker-compose-prod.yml`** — `frontend` (prod Dockerfile,
  `build.args.NEXT_PUBLIC_*` со значениями прод-домена как дефолтами, `depends_on: backend`,
  **без** host-порта, **без** `env_file` — рантайм-секретов нет). Сеть `app-network`.
- `app/bot/docker-compose-prod.yml` — **уже корректен** (bot + proxy). Оставляем.
- **REWRITE корневой `docker-compose-prod.yml`**:
  ```yaml
  include:
    - ./app/backend/docker-compose-prod.yml
    - ./app/bot/docker-compose-prod.yml
    - ./app/frontend/docker-compose-prod.yml
  services:
    caddy:
      image: caddy:2-alpine
      container_name: marriage-caddy
      ports: ["80:80", "443:443"]
      volumes:
        - ./caddy/Caddyfile:/etc/caddy/Caddyfile:ro
        - caddy_data:/data
        - caddy_config:/config
      depends_on: [frontend, backend]
      networks: [app-network]
      restart: unless-stopped
  volumes: { caddy_data: , caddy_config: }
  networks: { app-network: { driver: bridge } }
  ```

### 3. Caddy

- **CREATE `caddy/Caddyfile`**:
  ```
  marriage.soft-stack.ru {
    encode zstd gzip
    @api path /api/*
    reverse_proxy @api backend:8000
    reverse_proxy frontend:3000
  }
  ```
  Авто-TLS (нужны открытые 80/443 + A-запись). Cert в томе `caddy_data` переживает рестарты.

### 4. env: единственный `.env.example` + override-рендер

**Без `.env.prod.example`.** Источник шаблона — существующий `.env.example` каждого приложения.
Прод-значения не хранятся в файле, а инжектятся workflow'ом.

**`deployment/render-env.sh <template> <out>`** — семантика: копирует шаблон построчно; для строки
`KEY=...`, если переменная `$KEY` **задана в окружении** — подставляет её значение (иначе строка
как есть). Так workflow:
- заполняет пустые секреты (`POSTGRES_*`, `BOT_TOKEN`);
- перекрывает dev-дефолты прод-значениями (`APP_DEBUG=False`, `SERVER_URL=http://backend:8000`,
  `TG_BOT_SUPER_USER_ID_LIST` — общий секрет для backend и bot).

**Рендерим только backend и bot.** Frontend прод-значения (`NEXT_PUBLIC_*`) идут через
`build.args` в compose, отдельный `.env` фронту не нужен.

**`deployment/render-singbox.sh`** — из `app/bot/sing-box.example.json` через `envsubst`
(ограниченный список переменных) подставляет VLESS-секреты. **UPDATE `app/bot/sing-box.example.json`**:
плейсхолдеры `<...>` → `${...}` (host/uuid/sni/pbk/sid), `server_port: 443` и
`flow: "xtls-rprx-vision"` — константы (не секрет, взяты из реальной рабочей подписки).

### 5. GitHub Actions

- **CREATE `.github/workflows/ci.yml`** — `pull_request` + `push` (tags-ignore `v*`):
  - `backend`/`bot`: `astral-sh/setup-uv`, `make check` (ruff check + format-check).
  - `frontend`: `oven-sh/setup-bun`, `bun install --frozen-lockfile && bun run lint` (biome).
- **CREATE `.github/workflows/deploy.yml`** — `push: tags: ['v*']`, `environment: production`:
  1. checkout.
  2. Рендер env: в `env:` — секреты + прод-оверрайды (`APP_DEBUG`, `SERVER_URL`) →
     `deployment/render-env.sh app/backend/.env.example app/backend/.env` (и bot).
  3. Рендер `app/bot/sing-box.json` из example через VLESS-секреты.
  4. `appleboy/ssh-action`: на сервере `cd /opt/marriage && git fetch --tags && git checkout --force <tag>`.
  5. `appleboy/scp-action`: залить `app/backend/.env`, `app/bot/.env`, `app/bot/sing-box.json`
     (gitignored — в репо их нет).
  6. `appleboy/ssh-action`: `docker compose -f docker-compose-prod.yml up -d --build && docker image prune -f`.
  - Миграции — в backend prod-entrypoint (`alembic upgrade head`).

### 6. Инструкция

- **CREATE `DEPLOY.md`** — step-by-step + дублирую в финальном ответе.

## GitHub Secrets / Variables

**Secrets** (Settings → Secrets → Actions, в environment `production`):
- SSH: `SSH_HOST`, `SSH_USER`, `SSH_PORT`, `SSH_PRIVATE_KEY`.
- Backend: `POSTGRES_DB`, `POSTGRES_USER`, `POSTGRES_PASSWORD`.
- Bot: `BOT_TOKEN`.
- Общий (backend + bot): `TG_BOT_SUPER_USER_ID_LIST` — JSON-список admin-id, один Secret на оба.
- VLESS/sing-box: `VLESS_HOST`, `VLESS_UUID`, `REALITY_SNI`, `REALITY_PUBLIC_KEY`, `REALITY_SHORT_ID`.

**Variables**: не требуются — прод-оверрайды (debug/URL) зашиты в workflow `env:` (несекретные).

## DEPLOY.md (структура)

1. Сервер: Docker + compose-plugin, открыть 80/443, deploy-пользователь.
2. DNS: A-запись `marriage.soft-stack.ru` → IP (ДО первого деплоя, иначе Caddy не выпустит cert).
3. SSH-ключ деплоя: пара → публичный в `authorized_keys`, приватный в GH Secret.
4. Клон репо на сервере в `/opt/marriage`.
5. GitHub Secrets — таблица выше.
6. Branch protection `master`: require PR, require status checks (ci jobs), no force-push.
7. Первый деплой: `git tag v1.0.0 && git push --tags`, смотреть Actions.
8. Проверка: HTTPS открылся, `/api/health` = `{"status":"ok"}`, бот отвечает супер-юзеру.
9. Ротация: сменить засветившийся `BOT_TOKEN`.

## Верификация

- Прод-сборка локально: `docker compose -f docker-compose-prod.yml build` — все образы без ошибок.
- `render-env.sh`: self-check (пустой ключ + ключ-с-дефолтом, env перекрывает).
- CI: PR → ruff (backend/bot) + biome (frontend) зелёные.
- Деплой: тег `v*` → стек поднялся; `curl -I https://marriage.soft-stack.ru` = 200 + валидный TLS;
  `curl .../api/health` = `{"status":"ok"}`; бот отвечает (проверка sing-box).
- Caddy-логи: cert выпущен, без ACME-ошибок.

## Риски / заметки

- **`X-BOT-USER-ID` без подписи**: `/api/*` публичен, можно подделать заголовок и читать
  `GET /api/guest`. Предсуществующая дыра, вне scope деплоя — флажок.
- **Один uvicorn-воркер** — для RSVP хватит. `# ponytail: gunicorn при росте нагрузки`.
- Теги `uv:latest`/`caddy:2`/`postgres:16` не пиннятся по digest — ок для старта.
- `.env`/`sing-box.json` уже в `.gitignore` (`!*.example`) — в репо не попадут.
