# Production Deploy: Marriage (compose-prod + GitHub Actions + Caddy TLS)

## Context

Проект готовят к первому проду на домене **marriage.soft-stack.ru**. Сейчас есть только
dev-инфраструктура: `docker-compose-*-local.yml` работают, но:

- Корневой `docker-compose-prod.yml` — пустой (0 байт).
- `app/backend/docker-compose-prod.yml` — пустой; прод-Dockerfile у backend нет.
- `app/frontend/docker-compose-prod.yml` — **сломан** (это копипаст bot-компоуза: содержит
  `bot`+`proxy`, а не `frontend`); прод-Dockerfile у frontend нет.
- `app/bot/docker-compose-prod.yml` — корректный (bot + sing-box proxy), прод-Dockerfile есть.
- Нет `.github/`, нет реверс-прокси, нет SSL.

Цель: собрать прод-стек за Caddy c авто-TLS (Let's Encrypt), прод-Dockerfile'ы,
рабочие prod-компоузы в одной сети, и CI/CD на GitHub Actions (lint/format + деплой по тегу
через SSH со сборкой на сервере). Плюс подробная инструкция по настройке репозитория и сервера.

## Принятые решения (из уточнения у пользователя)

| Вопрос | Решение |
|--------|---------|
| Деплой-механизм | **SSH + сборка на сервере**: runner по SSH `git pull` → `docker compose -f docker-compose-prod.yml up -d --build` |
| Триггер деплоя | **По git-тегу** `v*` (lint/format — на PR/push) |
| Домен | **Один домен, path `/api`**: `marriage.soft-stack.ru` → frontend; `/api/*` → backend |
| sing-box proxy | **Нужен**, `sing-box.json` рендерится на сервере из GitHub Secrets при деплое |

## Целевая архитектура

```
Браузер ──https──> Caddy (:80/:443, авто-TLS)
                     ├─ /api/*  ──> backend:8000   (root_path="/api", НЕ стрипаем префикс)
                     └─ /*      ──> frontend:3000  (next start, SSR)
Bot ──socks5──> proxy(sing-box) ──vless──> api.telegram.org
Bot ──http──> backend:8000/api  (напрямую по внутренней сети, минуя Caddy)
backend ──> db(postgres:16)
```

Все сервисы (`caddy, frontend, backend, db, bot, proxy`) — в одной сети `app-network`.
Прод-компоузы объединяются корневым `docker-compose-prod.yml` через `include:` — одноимённые
`app-network` при include мёржатся в одну сеть, поэтому сервисы резолвятся по имени.

**Важно про `/api`:** backend уже смонтирован под `root_path="/api"` (Starlette стрипает
префикс внутри), поэтому и bot (`SERVER_URL + /api`), и браузер зовут `.../api/...`, а Caddy
проксирует **без** `handle_path`-стрипа: `reverse_proxy @api backend:8000`.

## Файлы: создать / изменить

### 1. Docker (прод-образы)

- **CREATE `app/backend/docker/prod/Dockerfile`** — на базе local, но:
  `uv sync --frozen --no-install-project --no-dev` (без dev-группы), non-root `USER`,
  `ENTRYPOINT` на новый прод-entrypoint.
- **CREATE `app/backend/docker/prod/entrypoint.sh`** — `alembic upgrade head` → `exec uv run --no-sync src/main.py`
  (как local-entrypoint; reload/echo выключатся сами при `APP_DEBUG=False`).
- **CREATE `app/frontend/docker/prod/Dockerfile`** — multi-stage bun:
  `bun install --frozen-lockfile` → `ARG NEXT_PUBLIC_SERVER_URL` + `ENV` → `bun run build` →
  runtime-стадия `bun run start` (порт 3000). NEXT_PUBLIC_* пекутся на этапе `build`,
  поэтому передаём build-arg (env_file на build не влияет).
- `app/bot/docker/prod/Dockerfile` — **уже есть**, оставляем.

### 2. Prod-компоузы

- **EDIT `app/backend/docker-compose-prod.yml`** (сейчас пуст) — сервисы `backend` (prod
  Dockerfile, `env_file: .env`, `depends_on: db healthy`, **без** публикации портов на хост)
  и `db` (`postgres:16-alpine`, том `marriage-pg-data`, healthcheck `pg_isready`, **без**
  host-порта), сеть `app-network`.
- **REWRITE `app/frontend/docker-compose-prod.yml`** (сейчас сломан) — сервис `frontend`
  (prod Dockerfile, `build.args.NEXT_PUBLIC_SERVER_URL`, `env_file: .env`, `depends_on: backend`,
  без host-порта), сеть `app-network`.
- `app/bot/docker-compose-prod.yml` — **уже корректен** (bot + proxy). Мелкая правка:
  `depends_on: [proxy]` оставить (backend в другом include-файле той же сети).
- **REWRITE корневой `docker-compose-prod.yml`**:
  ```yaml
  include:
    - ./app/backend/docker-compose-prod.yml
    - ./app/bot/docker-compose-prod.yml
    - ./app/frontend/docker-compose-prod.yml
  services:
    caddy:
      image: caddy:2-alpine
      ports: ["80:80", "443:443"]
      volumes:
        - ./Caddyfile:/etc/caddy/Caddyfile:ro
        - caddy_data:/data
        - caddy_config:/config
      depends_on: [frontend, backend]
      networks: [app-network]
      restart: unless-stopped
  volumes:
    caddy_data:
    caddy_config:
  networks:
    app-network:
      driver: bridge
  ```

### 3. Caddy

- **CREATE `Caddyfile`** (корень):
  ```
  marriage.soft-stack.ru {
    encode zstd gzip
    @api path /api/*
    reverse_proxy @api backend:8000
    reverse_proxy frontend:3000
  }
  ```
  Авто-TLS Let's Encrypt из коробки (нужны открытые 80/443 и A-запись на сервер).
  Сертификаты переживают рестарты в томе `caddy_data`.

### 4. Prod-шаблоны env (источник для CI-рендера)

Отдельные прод-шаблоны, чтобы не ломать dev `.env.example` (в проде отличаются debug/URL/CORS).
Все **непустые** значения — не секреты; **пустые** ключи CI заполнит из GitHub Secrets.

- **CREATE `app/backend/.env.prod.example`**: `APP_DEBUG=False`, `APP_HOST=0.0.0.0`, `APP_PORT=8000`,
  `APP_VERSION=...`, `APP_CORS_ORIGIN=["https://marriage.soft-stack.ru"]`, `POSTGRES_HOST=db`,
  `POSTGRES_PORT=5432`, пустые `POSTGRES_DB=`, `POSTGRES_USER=`, `POSTGRES_PASSWORD=`, `TG_BOT_SUPER_USER_ID=`.
- **CREATE `app/bot/.env.prod.example`**: пустой `BOT_TOKEN=`, `BOT_PROXY_URL=socks5://proxy:1080`,
  пустой `BOT_SUPER_USER_ID=`, `SERVER_URL=http://backend:8000`.
- **CREATE `app/frontend/.env.prod.example`**: `NEXT_PUBLIC_PORT=3000`,
  `NEXT_PUBLIC_HOST=marriage.soft-stack.ru`, `NEXT_PUBLIC_SERVER_URL=https://marriage.soft-stack.ru`
  (публичное, не секрет).
- **CREATE `app/bot/sing-box.example.json`** — перевести плейсхолдеры `<VLESS_HOST>`→`${VLESS_HOST}`
  и т.д. под `envsubst` (файл уже есть, только формат плейсхолдеров).

### 5. Скрипт рендера env

- **CREATE `scripts/render-env.sh`** — заполняет только пустые `KEY=` из окружения (indirect
  expansion), остальное (значения, комментарии) пропускает без изменений:
  ```bash
  #!/usr/bin/env bash
  # render-env.sh <template> <out>  — пустой KEY= берётся из $KEY окружения
  set -euo pipefail
  while IFS= read -r line || [ -n "$line" ]; do
    if [[ "$line" =~ ^([A-Za-z_][A-Za-z0-9_]*)=$ ]]; then
      key="${BASH_REMATCH[1]}"; printf '%s=%s\n' "$key" "${!key-}"
    else printf '%s\n' "$line"; fi
  done < "$1" > "$2"
  ```
  Проверка (self-check): прогнать на тест-шаблоне с одним пустым и одним заполненным ключом,
  сравнить вывод.

### 6. GitHub Actions

- **CREATE `.github/workflows/ci.yml`** — триггер `pull_request` + `push` (не теги):
  - job `backend`: `astral-sh/setup-uv`, `cd app/backend && make check` (ruff check + format-check).
  - job `bot`: то же для `app/bot`.
  - job `frontend`: `oven-sh/setup-bun`, `cd app/frontend && bun install --frozen-lockfile && bun run lint` (biome check).
- **CREATE `.github/workflows/deploy.yml`** — триггер `push: tags: ['v*']`, `environment: production`:
  1. checkout.
  2. Рендер env: экспортировать секреты в env → `scripts/render-env.sh app/backend/.env.prod.example app/backend/.env`
     (и bot, frontend).
  3. Рендер `sing-box.json` из `app/bot/sing-box.example.json` через `envsubst` (VLESS-секреты в env).
  4. `appleboy/ssh-action`: на сервере `cd /opt/marriage && git fetch --tags && git checkout <tag>`.
  5. `appleboy/scp-action`: скопировать сгенерированные `app/*/.env` и `app/bot/sing-box.json`
     в `/opt/marriage/...` (они gitignored, в репо их нет).
  6. `appleboy/ssh-action`: `cd /opt/marriage && docker compose -f docker-compose-prod.yml up -d --build && docker image prune -f`.
  - Миграции применяются автоматически в backend prod-entrypoint (`alembic upgrade head`).

### 7. Инструкция

- **CREATE `DEPLOY.md`** — step-by-step (см. раздел ниже), плюс дублирую в финальном ответе.

## GitHub Secrets / Variables

**Secrets** (Settings → Secrets → Actions, желательно в environment `production`):
- SSH: `SSH_HOST`, `SSH_USER`, `SSH_PORT`, `SSH_PRIVATE_KEY`.
- Backend: `POSTGRES_DB`, `POSTGRES_USER`, `POSTGRES_PASSWORD`, `TG_BOT_SUPER_USER_ID`.
- Bot: `BOT_TOKEN`, `BOT_SUPER_USER_ID`.
- VLESS/sing-box: `VLESS_HOST`, `VLESS_UUID`, `REALITY_SNI`, `REALITY_PUBLIC_KEY`, `REALITY_SHORT_ID`.

**Variables**: не требуются — все несекретные прод-значения зашиты в `.env.prod.example`.
(Если захотим вынести домен/CORS в Variables — можно, но по умолчанию не нужно.)

## DEPLOY.md (структура step-by-step)

1. **Сервер: базовая подготовка** — Docker + compose-plugin, открыть 80/443, deploy-пользователь.
2. **DNS** — A-запись `marriage.soft-stack.ru` → IP сервера (обязательно ДО первого деплоя, иначе Caddy не выпустит cert).
3. **SSH-ключ деплоя** — сгенерировать пару, публичный → `~/.ssh/authorized_keys` на сервере, приватный → GH Secret `SSH_PRIVATE_KEY`.
4. **Клон репо на сервере** — `git clone` в `/opt/marriage`.
5. **GitHub Secrets** — таблица выше, где и что вставить.
6. **Branch protection** для `master` — require PR, require status checks (ci.yml jobs), no force-push.
7. **Первый деплой** — `git tag v1.0.0 && git push --tags`, наблюдать Actions.
8. **Проверка** — `https://marriage.soft-stack.ru` открылась по HTTPS, `/api/health` = `{"status":"ok"}`, бот отвечает супер-юзеру.
9. **Ротация секретов** — ротировать текущий `BOT_TOKEN` (он засветился в рабочем `.env`).

## Верификация

- **Локально прод-сборка**: `docker compose -f docker-compose-prod.yml build` собирает все образы
  без ошибок (env для рендера подставить вручную/через тестовый `.env`).
- **render-env.sh**: self-check на тест-шаблоне (пустой + заполненный ключ).
- **CI**: открыть PR → `ci.yml` гоняет ruff (backend/bot) + biome (frontend) зелёным.
- **Деплой**: `git push` тега `v*` → на сервере поднялся стек; `curl -I https://marriage.soft-stack.ru`
  = 200 + валидный TLS; `curl https://marriage.soft-stack.ru/api/health` = `{"status":"ok"}`;
  бот в Telegram отвечает супер-пользователю (проверка sing-box-проксирования).
- Caddy-логи (`docker compose logs caddy`) — cert выпущен, без ACME-ошибок.

## Риски / заметки (не фиксим в этой итерации, если не попросят)

- **Backend доверяет заголовку `X-BOT-USER-ID` без подписи**: `/api/*` публичен (нужен фронту),
  значит можно подделать `X-BOT-USER-ID: <super_id>` и читать `GET /api/guest`/`/api/invitation`.
  Предсуществующая дыра. Флажок — стоит закрыть (общий секрет bot↔backend), но вне scope деплоя.
- **Один uvicorn-воркер** — для RSVP-сайта хватит. Потолок: если нагрузка вырастет —
  gunicorn/`--workers`. `# ponytail: single worker, add gunicorn if traffic grows`.
- **`uv:latest`/`caddy:2`/`postgres:16`** — теги не пиннятся по digest. Ок для старта; при желании — пин.
- `.env`/`sing-box.json` уже в `.gitignore` (`!*.example`), в репо не попадут.
