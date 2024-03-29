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

RUN npm run build

# Production stage
FROM nginx:stable-alpine as production

RUN apk update && apk add --no-cache openssl \
    && mkdir /etc/nginx/ssl

COPY --from=build /usr/src/app/build /usr/share/nginx/html
RUN rm /etc/nginx/conf.d/default.conf

COPY nginx/nginx.conf /etc/nginx/conf.d
COPY secret/* /etc/nginx/ssl/

RUN chmod 777 ./etc/nginx/ssl/fullchain.pem && chmod 777 ./etc/nginx/ssl/ssl_keychain.pem

CMD ["nginx", "-g", "daemon off;"]