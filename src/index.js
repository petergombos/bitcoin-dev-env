const bitcoin = require("bitcoinjs-lib");
const { alice, bob, carol } = require("./wallets.json");
const { RegtestUtils } = require("regtest-client");
const zmq = require("zeromq");
const regtestUtils = new RegtestUtils({
  bitcoin,
});
const network = bitcoin.networks.regtest;

const keyPairAlice1 = bitcoin.ECPair.fromWIF(alice[1].wif, network);

const p2wpkhAlice1 = bitcoin.payments.p2wpkh({
  pubkey: keyPairAlice1.publicKey,
  network,
});

async function main() {
  sock = zmq.socket("sub");
  sock.connect("tcp://127.0.0.1:28332");
  sock.subscribe("hashtx");
  sock.on("message", function (topic, message) {
    console.log("ZMQ");
    console.log(topic.toString(), message.toString("hex"));
  });

  await regtestUtils.mine(1);
  const { txId, value } = await regtestUtils.faucet(alice[1].p2wpkh, 1e8);

  const psbt = new bitcoin.Psbt({ network });
  await psbt.addInput({
    hash: txId,
    index: 0,
    witnessUtxo: {
      script: Buffer.from("0014" + alice[1].pubKeyHash, "hex"),
      value,
    },
  });
  await psbt.addOutput({
    address: bob[1].p2pkh,
    value: value / 2 - 1000,
  });
  await psbt.addOutput({
    address: alice[1].p2wpkh,
    value: value / 2,
  });
  psbt.signInput(0, keyPairAlice1);
  psbt.validateSignaturesOfInput(0);
  psbt.finalizeAllInputs();
  console.log("Transaction hexadecimal:");
  const tx = psbt.extractTransaction().toHex();
  console.log(tx);
  await regtestUtils.broadcast(tx);
  await regtestUtils.mine(1);
}

main().catch(console.error);
