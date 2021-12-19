# Bitcoin development environment

A complete local setup for bitcoin-based app development. All services are containerised with docker and configured to work together perfectly using docker-compose.

## Services

### Bitcoin Core v22

Flexible multi-arch (amd & amd64) Bitcoin Core Docker image. [Github](https://github.com/lncm/docker-bitcoind)

### Electrs

A block chain index engine and HTTP API written in Rust based on romanz/electrs.
API documentation is available [here](https://github.com/blockstream/esplora/blob/master/API.md).

### Esplora

Block explorer web interface based on the Electrs HTTP API. [Github](https://github.com/Blockstream/esplora#how-to-run-the-explorer-for-bitcoin-mainnet)

- Explore blocks, transactions and addresses
- Support for Segwit and Bech32 addresses
- Shows previous output and spending transaction details
- Quick-search for txid, address, block hash or height
- Advanced view with script hex/assembly, witness data, outpoints and more

### Regtest server

A regtest server for bitcoinjs-lib testing. [Github](https://github.com/bitcoinjs/regtest-server)

## Usage

Start all services

```sh
docker-compose up
```

Init master wallet that will receive bitcoin when blocks are mined.

```sh
./init-wallet.sh
```

Native Segwit P2WPKH Wallet

```js
// Init wallet from mnemonic
const wallet = new Wallet({
  mnemonic:
    "blouse blossom fade disagree matrix deer clog pulp rich survey atom tackle",
  network: bitcoin.networks.regtest,
});

// Sync wallet to get latest balance and utxos

await wallet.sync();
console.log(wallet.balance);
console.log(wallet.utxos);

// Send some money
await wallet.send("bcrt1qgr6pdr83674x0yrgwhcgnudn4k5j3lqrseu8hw", 1);
```

ZMQ

```js
  // Subscribe to the zeromq stream
  sock = zmq.socket("sub");
  sock.connect("tcp://127.0.0.1:28332");
  sock.subscribe("rawtx");
  sock.on("message", function (topic, message) {
    // Handle rawtx events
    if (topic.toString() === "rawtx") {
      const tx = bitcoin.Transaction.fromHex(message);
      console.log(tx)
  });
```

Regtest utils [More info on Github](https://github.com/bitcoinjs/regtest-client)

```js
// Send coins to our wallet
await regtestUtils.faucet(wallet.address, 10e8);

// Mine blocks
await regtestUtils.mine(1);
```

Happy hacking!
