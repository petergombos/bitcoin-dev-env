const bitcoin = require("bitcoinjs-lib");
const { bob } = require("./wallets.json");
const { RegtestUtils } = require("regtest-client");
const zmq = require("zeromq");
const Wallet = require("./wallet");
const regtestUtils = new RegtestUtils({
  bitcoin,
});
const network = bitcoin.networks.regtest;

const wallet = new Wallet({
  mnemonic:
    "blouse blossom fade disagree matrix deer clog pulp rich survey atom tackle",
  path: "m/0'/0'/0'",
  network,
});

function getPayment(output) {
  let payment;
  Object.keys(bitcoin.payments).find((type) => {
    try {
      payment = bitcoin.payments[type]({ output: output.script, network });
      return true;
    } catch (e) {
      return false;
    }
  });
  return payment;
}

async function main() {
  regtestUtils.mine(100);

  sock = zmq.socket("sub");
  sock.connect("tcp://127.0.0.1:28332");
  sock.subscribe("rawtx");
  sock.on("message", function (topic, message) {
    const tx = bitcoin.Transaction.fromHex(message);

    tx.outs.forEach((output) => {
      const p = getPayment(output);
      console.log({
        txid: tx.getId(),
        address: p.address,
        amount: output.value,
      });
    });
  });

  const { txId, value, vout } = await regtestUtils.faucet(wallet.address, 1e8);
  const output = value / 2 - 1000;
  const change = value / 2;

  const psbt = new bitcoin.Psbt({ network });

  await psbt.addInput({
    hash: txId,
    index: vout,
    witnessUtxo: {
      script: Buffer.from("0014" + wallet.pubKeyHash.toString("hex"), "hex"),
      value,
    },
  });
  await psbt.addOutput({
    address: bob[1].p2pkh,
    value: output,
  });
  await psbt.addOutput({
    address: wallet.address,
    value: change,
  });
  psbt.signInput(0, wallet.ECPair);
  psbt.validateSignaturesOfInput(0);
  psbt.finalizeAllInputs();
  console.log("Transaction hexadecimal:");
  const tx = psbt.extractTransaction().toHex();
  console.log(tx);
  await regtestUtils.broadcast(tx);
}

main().catch(console.error);
