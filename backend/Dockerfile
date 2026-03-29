FROM node:24-alpine

WORKDIR /app

COPY package.json package-lock.json ./
COPY backend/package.json ./backend/package.json

RUN npm install

COPY backend ./backend

RUN npx prisma generate --schema backend/prisma/schema.prisma

WORKDIR /app/backend

EXPOSE 4000

CMD ["npm", "run", "dev"]
