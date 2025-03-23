FROM node:22.12 AS builder

WORKDIR /app

COPY package.json package-lock.json* ./

RUN npm ci

COPY . .

RUN npm run build

FROM node:22.12

WORKDIR /app

COPY --from=builder /app/dist ./dist
COPY --from=builder /app/dist/drizzle.config.js ./
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/drizzle ./drizzle
COPY --from=builder /app/.env ./.env
COPY package.json package-lock.json* ./

ENV NODE_ENV=production

CMD ["npm", "run", "start"]
