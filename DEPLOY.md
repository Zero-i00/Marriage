# Деплой Marriage в прод

Домен: **marriage.soft-stack.ru**. Стек: Caddy (авто-TLS) → frontend (Next SSR) + backend
(`/api/*`), backend → Postgres, bot (polling) → sing-box (VLESS) → Telegram.

Деплой запускается **git-тегом** `v*`: GitHub Actions рендерит `.env`/`sing-box.json` из
секретов, заливает их на сервер по SCP, затем по SSH обновляет тег и пересобирает
`docker-compose-prod.yml`. CI (lint/format) гоняется отдельно на каждый push/PR.

## 1. Сервер: базовая подготовка

```bash
# на сервере (Ubuntu/Debian)
sudo apt update && sudo apt install -y docker.io docker-compose-plugin git
sudo usermod -aG docker $USER   # перелогиниться после этого

# фаервол — открыть 80/443 (и 22 для SSH)
sudo ufw allow 22,80,443/tcp
```

Проверить: `docker compose version` работает.

## 2. DNS

В панели домена `soft-stack.ru` добавить **A-запись**:

```
marriage.soft-stack.ru → <IP сервера>
```

Подождать распространения (`dig marriage.soft-stack.ru`). Сделать **до** первого деплоя —
иначе Caddy не сможет выпустить Let's Encrypt сертификат (ACHTUNG: HTTP-01 challenge идёт
по этому же домену на 80 порт).

## 3. SSH-ключ для деплоя

Локально (не на сервере):

```bash
ssh-keygen -t ed25519 -C "github-deploy-marriage" -f ./deploy_key -N ""
```

На сервере — добавить публичный ключ:

```bash
mkdir -p ~/.ssh && chmod 700 ~/.ssh
cat deploy_key.pub >> ~/.ssh/authorized_keys   # скопировать содержимое deploy_key.pub
chmod 600 ~/.ssh/authorized_keys
```

Приватный ключ (`deploy_key`, без `.pub`) пойдёт в GitHub Secret `SSH_PRIVATE_KEY` (шаг 5).
После добавления в Secrets — **удалить локальные файлы ключа**.

## 4. Клонировать репозиторий на сервере

```bash
sudo mkdir -p /opt/marriage && sudo chown $USER:$USER /opt/marriage
git clone <URL_РЕПОЗИТОРИЯ> /opt/marriage
cd /opt/marriage
```

Деплой-пользователь (из шага 3) должен иметь права читать/писать `/opt/marriage` и запускать
`docker compose` (быть в группе `docker`).

## 5. GitHub Secrets

**Settings → Secrets and variables → Actions.** Рекомендуется создать
**Environment `production`** (Settings → Environments → New environment) и класть секреты туда
(а не в общие repo secrets) — так к ним требуется approval/ограничение по окружению.

| Secret | Значение | Где взять |
|---|---|---|
| `SSH_HOST` | IP или домен сервера | — |
| `SSH_USER` | пользователь для SSH (из шага 3) | — |
| `SSH_PORT` | обычно `22` | — |
| `SSH_PRIVATE_KEY` | содержимое приватного ключа `deploy_key` | шаг 3 |
| `POSTGRES_DB` | имя БД, напр. `app_db` | придумать |
| `POSTGRES_USER` | пользователь БД, напр. `app` | придумать |
| `POSTGRES_PASSWORD` | стойкий пароль | сгенерировать (`openssl rand -hex 24`) |
| `BOT_TOKEN` | токен Telegram-бота | @BotFather (**новый**, старый токен засветился — см. шаг 9) |
| `TG_BOT_SUPER_USER_ID_LIST` | JSON-список Telegram id админов, напр. `["1529841680"]` | свой Telegram user id |
| `VLESS_HOST` | адрес VLESS-сервера, напр. `de.soft-stack.ru` | из VPN-подписки |
| `VLESS_UUID` | UUID из VLESS-ссылки | из VPN-подписки |
| `REALITY_SNI` | `server_name` для Reality (совпадает с host) | из VPN-подписки |
| `REALITY_PUBLIC_KEY` | параметр `pbk` из VLESS-ссылки | из VPN-подписки |
| `REALITY_SHORT_ID` | параметр `sid` из VLESS-ссылки | из VPN-подписки |

Все остальные прод-переменные (например `APP_DEBUG=False`, `SERVER_URL=http://backend:8000`)
уже зашиты в `.github/workflows/deploy.yml` — их не нужно вручную указывать в GitHub.

## 6. Branch protection для `master`

**Settings → Branches → Add rule** для `master`:
- ✅ Require a pull request before merging
- ✅ Require status checks to pass before merging → выбрать jobs `backend`, `bot`, `frontend` из `ci.yml`
- ✅ Do not allow force pushes
- ✅ Do not allow deletions

(Опционально: Require approvals ≥ 1, если работаете не в одиночку.)

## 7. Первый деплой

```bash
git checkout master && git pull
git tag v1.0.0
git push origin v1.0.0
```

Открыть **Actions** в GitHub, смотреть workflow `Deploy`. Если упадёт на SSH-шаге — проверить
`SSH_HOST`/`SSH_PORT`/ключ и что порт 22 открыт наружу.

## 8. Проверка после деплоя

```bash
curl -I https://marriage.soft-stack.ru            # 200, валидный сертификат
curl https://marriage.soft-stack.ru/api/health     # {"status":"ok"}
```

- Открыть сайт в браузере — форма приглашения работает.
- Написать боту в Telegram от аккаунта из `TG_BOT_SUPER_USER_ID_LIST` — должен ответить.
- На сервере: `docker compose -f docker-compose-prod.yml logs caddy` — сертификат выпущен,
  ошибок ACME нет; `docker compose -f docker-compose-prod.yml ps` — все контейнеры `Up`.

## 9. Ротация секретов

Текущий `BOT_TOKEN` был в незашифрованном `.env` в рабочем каталоге разработчика — считать его
скомпрометированным. **До прод-деплоя**: зайти в @BotFather → `/revoke` → получить новый токен →
положить в Secret `BOT_TOKEN` (шаг 5). Аналогично проверить `POSTGRES_PASSWORD` — в проде должен
быть новый пароль, не тот, что использовался локально.

## Последующие деплои

Любой новый тег `vX.Y.Z` (semver, обязательно с `v`) на `master` запускает деплой:

```bash
git tag v1.1.0
git push origin v1.1.0
```

Откат — задеплоить более старый тег повторно (`git push origin v1.0.0 -f` не нужен: просто
запушить существующий тег заново не сработает, GitHub не триггерит на уже существующий пуш;
проще на сервере вручную `git checkout v1.0.0 && docker compose -f docker-compose-prod.yml up -d --build`).
