# Development stage
FROM node:20.2-alpine as development

WORKDIR /usr/src/app

RUN npm install -g @nestjs/cli

COPY package*.json ./

RUN npm install --only=development
RUN mkdir -p avatar

COPY . .

CMD ["npm", "run", "build"]

# Build stage
FROM node:20.2-alpine as build

WORKDIR /usr/src/app

COPY package*.json ./

RUN npm ci --only=development

COPY . .

RUN npm run build

# Production stage
FROM node:20.2-alpine as production

WORKDIR /usr/src/app

COPY package*.json ./

RUN npm install -g @nestjs/cli
RUN npm ci
RUN mkdir -p avatar

COPY . .

COPY --from=build /usr/src/app/dist ./dist

CMD ["npm", "start"]