FROM ubuntu:18.04

RUN apt update && apt install -y software-properties-common

RUN apt update && \
  apt install -y \
  curl \
  wget \
  tar \
  git \
  nodejs \
  npm \
  python \
  build-essential \
  gnupg2 \
  libzmq3-dev \
  libsnappy-dev && \
  curl --silent --location https://deb.nodesource.com/setup_10.x | bash -
WORKDIR /root

RUN mkdir /root/regtest-data
RUN echo "satoshi" > /root/regtest-data/KEYS

RUN git clone https://github.com/bitcoinjs/regtest-server.git
WORKDIR /root/regtest-server

RUN npm install

ENV RPCCOOKIE=/root/.bitcoin/regtest/.cookie
ENV KEYDB=/root/regtest-data/KEYS
ENV INDEXDB=/root/regtest-data/db
ENV ZMQ=tcp://bitcoind:28332
ENV RPCCONCURRENT=32
ENV RPC=http://bitcoind:18443
ENV PORT=8080
ENV DEBUG=*

ENTRYPOINT ["node", "index.js"]