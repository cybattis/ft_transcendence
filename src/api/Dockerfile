FROM node:19.8.1-alpine3.17

WORKDIR /usr/src/app

RUN npm install -g @nestjs/cli

COPY package*.json ./

RUN npm install

COPY . .

CMD ["npm", "run", "start:dev"]
