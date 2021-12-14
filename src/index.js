const bitcoin = require("bitcoinjs-lib");
const { carol } = require("./wallets.json");
const zmq = require("zeromq");
const Wallet = require("./wallet");
const { RegtestUtils } = require("regtest-client");
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

  setInterval(() => {
    regtestUtils.mine(1);
  }, 10 * 1000);

  // await regtestUtils.faucet(wallet.address, 10e8);

  await wallet.send(carol[1].p2pkh, 0.1);
}

main().catch(console.error);
