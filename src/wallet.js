const bip39 = require("bip39");
const BIP32Factory = require("bip32").default;
const bitcoin = require("bitcoinjs-lib");
const ecc = require("tiny-secp256k1");
const createHash = require("create-hash");

const bip32 = BIP32Factory(ecc);

async function api(endpoint) {
  const fetch = (await import("node-fetch")).default;
  const response = await fetch(`http://localhost:3000${endpoint}`);
  const json = await response.json();
  return json;
}

class Wallet {
  static generateMnemonic() {
    return bip39.generateMnemonic();
  }

  constructor({ mnemonic, path = "m/44'/0'/0'/0/0", network }) {
    this.mnemonic = mnemonic;
    this.network = network || bitcoin.networks.bitcoin;
    this.seed = bip39.mnemonicToSeedSync(this.mnemonic);
    this.root = bip32.fromSeed(this.seed);
    this.child = this.root.derivePath(path);
    this.address = this.getAddress();
    this.pubKeyHash = this.getPublicKeyHash();
    this.ECPair = this.getECPair();
  }

  getAddress() {
    const { address } = bitcoin.payments.p2wpkh({
      pubkey: this.child.publicKey,
      network: this.network,
    });
    return address;
  }

  getPublicKeyHash() {
    const step1 = this.child.publicKey;
    const step2 = createHash("sha256").update(step1).digest();
    const pubKeyHash = createHash("rmd160").update(step2).digest();
    return pubKeyHash;
  }

  getECPair() {
    return bitcoin.ECPair.fromPrivateKey(this.child.privateKey);
  }

  async sync() {
    // Balance
    const { chain_stats } = await api(`/address/${this.address}`);
    this.balance = chain_stats.funded_txo_sum - chain_stats.spent_txo_sum;

    // Transactions
    const txs = await api(`/address/${this.address}/txs`);
    this.txs = txs;
  }
}

module.exports = Wallet;

async function main() {
  const wallet = new Wallet({
    mnemonic:
      "blouse blossom fade disagree matrix deer clog pulp rich survey atom tackle",
    path: "m/0'/0'/0'",
    network: bitcoin.networks.regtest,
  });

  await wallet.sync();
  console.log(wallet.balance);
}

main();
