# Development stage
FROM node:20.2-alpine as development

WORKDIR /usr/src/app

COPY package*.json ./

RUN npm install

COPY . .

CMD [ "npm", "run", "start" ]

#Build stage
FROM node:20.2-alpine as build

WORKDIR /usr/src/app

COPY package*.json ./

RUN npm install

COPY . .

CMD [ "npm", "run", "build" ]

# Production stage
FROM nginx:stable-alpine3.17 as production

WORKDIR /usr/src/app

ENV NODE_ENV production

COPY --from=build . /usr/share/nginx/html

COPY nginx.conf /etc/nginx/conf.d/default.conf

CMD ["nginx", "-g", "daemon off;"]
