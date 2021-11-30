FROM rust:1.56.1-slim AS builder

WORKDIR /build

RUN apt-get update
RUN apt-get install -y git clang cmake libsnappy-dev

RUN git clone --branch new-index https://github.com/blockstream/electrs .

RUN cargo install --locked --path .

FROM debian:bullseye

RUN apt-get update
RUN apt-get install -y libstdc++6 gcc-9 curl

RUN adduser --disabled-password --uid 1000 --home /data --gecos "" electrs
USER electrs
WORKDIR /data

COPY --from=builder /usr/local/cargo/bin/electrs /bin/electrs

EXPOSE 3000

ENTRYPOINT ["electrs"]
