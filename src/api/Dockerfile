FROM node:current-alpine

WORKDIR /usr/src/app

RUN npm install -g @nestjs/cli

COPY package*.json ./

RUN npm install

COPY . .

CMD ["npm", "run", "start:dev"]
