# Usage

```sh
docker-compose up
```

```sh
bitcoin-cli \
  -regtest \
  -datadir=/Users/petergombos/Projects/terrahash-poc/docker/datadir \
  generatetoaddress 101 bcrt1qlwyzpu67l7s9gwv4gzuv4psypkxa4fx4ggs05g
```

Edit `src/index.js` and transaction id for input.

```sh
node src/index.js
```
