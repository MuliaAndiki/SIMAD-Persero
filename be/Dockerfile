FROM oven/bun:1.1.45 AS build

WORKDIR /app

COPY package.json bun.lock ./
COPY prisma ./prisma/
RUN bun install

COPY . .

RUN bun run prisma:generate

EXPOSE 5000

CMD ["bun", "run", "src/serve.ts"]