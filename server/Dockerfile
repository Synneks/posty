# specify the node base image with your desired version node:<version>
FROM node:20 AS builder

COPY package.json package-lock.json ./

RUN npm install

COPY . . 
COPY .env.production .env

RUN npm run build

ENV NODE_ENV=production

# replace this with your application's default port
EXPOSE 8080
CMD [ "node", "dist/index.js" ]
USER node