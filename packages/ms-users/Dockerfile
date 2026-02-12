FROM node:20-alpine AS builder

WORKDIR /app

COPY package*.json ./
COPY prisma ./prisma
RUN npm install

COPY . .
RUN npm run build

FROM node:20-alpine AS production

WORKDIR /app

COPY package*.json ./
COPY prisma ./prisma
RUN npm install --omit=dev

COPY --from=builder /app/dist ./dist

EXPOSE 3002

CMD ["npm", "run", "start:prod"]
