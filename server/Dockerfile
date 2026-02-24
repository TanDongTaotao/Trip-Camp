ARG NODE_IMAGE=node:lts-bookworm-slim
FROM ${NODE_IMAGE}

WORKDIR /app/server

COPY package*.json ./
RUN npm ci --omit=dev

COPY . .

EXPOSE 3000

CMD ["node", "src/index.js"]
