#!/usr/bin/env bash
# render-env.sh <template> <out>
#
# Копирует .env.example построчно. Для строки `KEY=значение` — если переменная
# $KEY задана в окружении вызывающего процесса, подставляет её значение вместо
# значения из шаблона (используется CI, чтобы заполнить пустые секреты и
# перекрыть dev-дефолты прод-значениями). Строки без "KEY=" (комментарии,
# пустые строки) копируются как есть.
set -euo pipefail

: "${1:?usage: render-env.sh <template> <out>}"
: "${2:?usage: render-env.sh <template> <out>}"
template="$1"
out="$2"

while IFS= read -r line || [ -n "$line" ]; do
  if [[ "$line" =~ ^([A-Za-z_][A-Za-z0-9_]*)= ]] && [ -n "${!BASH_REMATCH[1]+x}" ]; then
    printf '%s=%s\n' "${BASH_REMATCH[1]}" "${!BASH_REMATCH[1]}"
  else
    printf '%s\n' "$line"
  fi
done < "$template" > "$out"
