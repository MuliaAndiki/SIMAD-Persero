FROM oven/bun:1.2 AS build

WORKDIR /app

COPY package.json bun.lock prisma.config.ts ./
COPY prisma ./prisma/
RUN bun install

COPY . .

RUN bun run prisma:generate

EXPOSE 5000

CMD ["bun", "run", "src/serve.ts"]