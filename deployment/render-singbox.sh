#!/usr/bin/env bash
# render-singbox.sh <template> <out>
#
# Подставляет VLESS/Reality-секреты в sing-box.example.json через envsubst,
# ограниченный явным списком переменных (чтобы случайно не тронуть другие $-строки).
set -euo pipefail

: "${1:?usage: render-singbox.sh <template> <out>}"
: "${2:?usage: render-singbox.sh <template> <out>}"
template="$1"
out="$2"

: "${VLESS_HOST:?VLESS_HOST is required}"
: "${VLESS_UUID:?VLESS_UUID is required}"
: "${REALITY_SNI:?REALITY_SNI is required}"
: "${REALITY_PUBLIC_KEY:?REALITY_PUBLIC_KEY is required}"
: "${REALITY_SHORT_ID:?REALITY_SHORT_ID is required}"

envsubst '${VLESS_HOST} ${VLESS_UUID} ${REALITY_SNI} ${REALITY_PUBLIC_KEY} ${REALITY_SHORT_ID}' \
  < "$template" > "$out"
