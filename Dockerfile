FROM node:24.19.0-alpine AS build

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build

FROM node:24.19.0-alpine AS runtime

WORKDIR /app

RUN npm install --global serve

COPY --from=build /app/dist ./dist

EXPOSE 4173

CMD ["serve", "-s", "dist", "-l", "tcp://0.0.0.0:4173"]
