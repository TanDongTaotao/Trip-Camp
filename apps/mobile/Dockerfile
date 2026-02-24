ARG NODE_IMAGE=node:lts-bookworm-slim
FROM ${NODE_IMAGE} AS build

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .

ARG TARO_APP_API_BASE_URL
ENV TARO_APP_API_BASE_URL=$TARO_APP_API_BASE_URL
ENV NODE_ENV=production

RUN npm run build:h5

ARG NGINX_IMAGE=nginx:stable-alpine
FROM ${NGINX_IMAGE:-nginx:stable-alpine}

COPY --from=build /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80
