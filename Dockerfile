# Сборка frontend и раздача через nginx (п. 2.3: всё приложение поднимается через docker compose up).

# ---------- 1. сборка ----------
FROM node:22-alpine AS build

WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci

COPY . .

# адрес API внутри docker-сети: nginx проксирует /api на backend (см. nginx.conf.template)
ARG VITE_API_URL=/api
ARG VITE_USE_MOCKS=false
ENV VITE_API_URL=$VITE_API_URL
ENV VITE_USE_MOCKS=$VITE_USE_MOCKS

RUN npm run build

# ---------- 2. раздача ----------
FROM nginx:1.27-alpine

# куда nginx отправляет запросы /api — имя сервиса backend в docker-compose
ENV BACKEND_URL=http://backend:8080

COPY nginx.conf.template /etc/nginx/templates/default.conf.template
COPY --from=build /app/dist /usr/share/nginx/html

EXPOSE 80
