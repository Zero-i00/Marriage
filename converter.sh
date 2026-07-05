#!/usr/bin/env bash
#
# img2webp.sh — конвертер изображений SVG/PNG → WebP
#
# Использование:
#   ./img2webp.sh                 # интерактивный режим (вопросы по шагам)
#   ./img2webp.sh ./icons         # папка передана аргументом
#   ./img2webp.sh -f png -q 80 -r --delete ./assets
#
set -euo pipefail

# ─────────────────────────── Оформление ───────────────────────────
if [[ -t 1 ]]; then
    BOLD=$'\033[1m'; DIM=$'\033[2m'; RED=$'\033[31m'
    GRN=$'\033[32m'; YLW=$'\033[33m'; BLU=$'\033[34m'; RST=$'\033[0m'
else
    BOLD=''; DIM=''; RED=''; GRN=''; YLW=''; BLU=''; RST=''
fi

info()  { printf '%s\n' "${BLU}ℹ${RST}  $*"; }
ok()    { printf '%s\n' "${GRN}✓${RST}  $*"; }
warn()  { printf '%s\n' "${YLW}⚠${RST}  $*" >&2; }
err()   { printf '%s\n' "${RED}✗${RST}  $*" >&2; }
die()   { err "$*"; exit 1; }

# ─────────────────────────── Значения по умолчанию ───────────────────────────
FOLDER=""
SRC_FMT=""          # svg | png
QUALITY=90          # 0-100
SCALE=1             # множитель разрешения (только SVG)
RECURSIVE=0
DELETE_SRC=0
LOSSLESS=0
ASSUME_YES=0        # пропустить подтверждение удаления

usage() {
    cat <<EOF
${BOLD}img2webp.sh${RST} — конвертация SVG/PNG в WebP

${BOLD}Использование:${RST}
  $(basename "$0") [опции] [папка]

${BOLD}Опции:${RST}
  -f, --format <svg|png>   исходный формат
  -q, --quality <0-100>    качество WebP (по умолчанию: ${QUALITY})
  -s, --scale <число>      множитель разрешения для SVG (по умолчанию: ${SCALE})
  -r, --recursive          обрабатывать вложенные папки
      --lossless           конвертация без потерь
      --delete             удалять исходники после успешной конвертации
  -y, --yes                не спрашивать подтверждения (для удаления)
  -h, --help               показать эту справку

${BOLD}Примеры:${RST}
  $(basename "$0") ./icons
  $(basename "$0") -f png -q 80 --delete ./assets
EOF
}

# ─────────────────────────── Разбор аргументов ───────────────────────────
while [[ $# -gt 0 ]]; do
    case "$1" in
        -f|--format)    SRC_FMT="${2,,}"; shift 2 ;;
        -q|--quality)   QUALITY="$2"; shift 2 ;;
        -s|--scale)     SCALE="$2"; shift 2 ;;
        -r|--recursive) RECURSIVE=1; shift ;;
        --lossless)     LOSSLESS=1; shift ;;
        --delete)       DELETE_SRC=1; shift ;;
        -y|--yes)       ASSUME_YES=1; shift ;;
        -h|--help)      usage; exit 0 ;;
        -*)             die "Неизвестная опция: $1 (см. --help)" ;;
        *)              FOLDER="$1"; shift ;;
    esac
done

# ─────────────────────────── Вспомогательные функции ───────────────────────────
ask() {  # ask "Вопрос" "значение_по_умолчанию" → echo ответа
    local prompt="$1" default="${2:-}" answer
    read -rp "$prompt " answer || true
    printf '%s' "${answer:-$default}"
}

is_yes() {  # принимает y/yes/д/да в любом регистре
    case "${1,,}" in y|yes|д|да) return 0 ;; *) return 1 ;; esac
}

check_deps() {
    local needed=(cwebp) cmd
    [[ "$SRC_FMT" == "svg" ]] && needed+=(rsvg-convert)
    for cmd in "${needed[@]}"; do
        command -v "$cmd" &>/dev/null || die \
            "Не установлен '$cmd'. Установите: ${BOLD}sudo apt install librsvg2-bin webp${RST}"
    done
}

# ─────────────────────────── Интерактивные вопросы (если чего-то не хватает) ───────────────────────────
[[ -z "$FOLDER" ]] && FOLDER="$(ask "Введите путь к папке с картинками:")"
FOLDER="${FOLDER%/}"
[[ -d "$FOLDER" ]] || die "Папка '$FOLDER' не найдена."

if [[ -z "$SRC_FMT" ]]; then
    info "Из какого формата конвертировать?"
    printf '   1) SVG\n   2) PNG\n'
    case "$(ask 'Выбор [1/2]:')" in
        1) SRC_FMT="svg" ;;
        2) SRC_FMT="png" ;;
        *) die "Нужно ввести 1 или 2." ;;
    esac
fi
[[ "$SRC_FMT" =~ ^(svg|png)$ ]] || die "Формат должен быть svg или png."

# Спрашиваем про удаление только если не задано флагом
if [[ "$DELETE_SRC" -eq 0 && "$ASSUME_YES" -eq 0 ]]; then
    is_yes "$(ask 'Удалять исходные файлы после конвертации? [y/N]:' n)" && DELETE_SRC=1
fi

check_deps

# ─────────────────────────── Сбор файлов ───────────────────────────
find_args=("$FOLDER")
[[ "$RECURSIVE" -eq 1 ]] || find_args+=(-maxdepth 1)
find_args+=(-type f -iname "*.${SRC_FMT}")

mapfile -d '' -t files < <(find "${find_args[@]}" -print0)

if [[ ${#files[@]} -eq 0 ]]; then
    warn "В папке '$FOLDER' не найдено файлов .${SRC_FMT}"
    exit 0
fi

# ─────────────────────────── Подтверждение опасной операции ───────────────────────────
total=${#files[@]}
info "Найдено файлов: ${BOLD}${total}${RST} (.${SRC_FMT})"
if [[ "$DELETE_SRC" -eq 1 ]]; then
    warn "Исходные файлы будут УДАЛЕНЫ после конвертации."
    if [[ "$ASSUME_YES" -eq 0 ]]; then
        is_yes "$(ask 'Продолжить? [y/N]:' n)" || die "Отменено пользователем."
    fi
fi

# ─────────────────────────── Конвертация одного файла ───────────────────────────
convert_one() {  # convert_one <путь>
    local src="$1" webp="${1%.*}.webp"
    local q_args=(-quiet -q "$QUALITY")
    [[ "$LOSSLESS" -eq 1 ]] && q_args=(-quiet -lossless)

    if [[ "$SRC_FMT" == "svg" ]]; then
        rsvg-convert -z "$SCALE" "$src" -f png | cwebp "${q_args[@]}" -o "$webp" -- -
    else
        cwebp "${q_args[@]}" "$src" -o "$webp"
    fi
}

# ─────────────────────────── Основной цикл ───────────────────────────
converted=0; deleted=0; failed=0; i=0
for src in "${files[@]}"; do
    i=$((i+1))
    printf '%s' "${DIM}[${i}/${total}]${RST} "
    if convert_one "$src" 2>/dev/null; then
        ok "$(basename "$src") → $(basename "${src%.*}.webp")"
        converted=$((converted+1))
        if [[ "$DELETE_SRC" -eq 1 ]]; then
            rm -f "$src" && deleted=$((deleted+1))
        fi
    else
        err "Не удалось: $src"
        failed=$((failed+1))
    fi
done

# ─────────────────────────── Итог ───────────────────────────
echo
info "${BOLD}Готово.${RST}"
echo "   Сконвертировано: ${GRN}${converted}${RST}"
[[ "$deleted" -gt 0 ]] && echo "   Удалено исходников: ${YLW}${deleted}${RST}"
[[ "$failed"  -gt 0 ]] && echo "   Ошибок: ${RED}${failed}${RST}"

[[ "$failed" -eq 0 ]]