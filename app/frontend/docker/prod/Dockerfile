# syntax=docker/dockerfile:1

FROM oven/bun:1-alpine

WORKDIR /app

COPY package.json bun.lock ./
RUN bun install --frozen-lockfile

COPY . .

# NEXT_PUBLIC_* печётся в бандл на этапе build — прокидываем как build-arg
# (env_file в compose на build не влияет, только на runtime).
ARG NEXT_PUBLIC_PORT=3000
ARG NEXT_PUBLIC_HOST
ARG NEXT_PUBLIC_SERVER_URL
ENV NEXT_PUBLIC_PORT=$NEXT_PUBLIC_PORT \
    NEXT_PUBLIC_HOST=$NEXT_PUBLIC_HOST \
    NEXT_PUBLIC_SERVER_URL=$NEXT_PUBLIC_SERVER_URL

RUN bun run build

ENV NODE_ENV=production
EXPOSE 3000

CMD ["bun", "run", "start"]
