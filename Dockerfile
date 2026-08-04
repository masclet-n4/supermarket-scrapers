FROM oven/bun:1 AS runtime

WORKDIR /app

COPY package.json bun.lock ./
RUN bun install --frozen-lockfile --production

COPY src ./src
COPY tsconfig.json ./tsconfig.json

ENV NODE_ENV=production

CMD ["bun", "run", "start:cron"]
