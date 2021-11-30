FROM node:16-alpine

RUN apk add --no-cache git bash

WORKDIR /usr/src/app

RUN git clone https://github.com/Blockstream/esplora .

RUN npm install

RUN API_URL=http://localhost:3000 npm run dist

ENTRYPOINT ["npx", "http-server", "--proxy", "http://localhost:8080?", "dist"]