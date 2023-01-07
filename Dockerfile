FROM node:16-alpine

RUN mkdir /app
WORKDIR /app

COPY ./ ./

RUN npm ci