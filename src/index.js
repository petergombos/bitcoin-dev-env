const bitcoin = require("bitcoinjs-lib");
const { carol, dave, eve } = require("./wallets.json");
const zmq = require("zeromq");
const Wallet = require("./wallet");
const { RegtestUtils } = require("regtest-client");
const regtestUtils = new RegtestUtils({
  bitcoin,
});
const network = bitcoin.networks.regtest;

// Init dummy wallet
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
  // Subscribe to the zeromq stream
  sock = zmq.socket("sub");
  sock.connect("tcp://127.0.0.1:28332");
  sock.subscribe("rawtx");
  sock.on("message", function (topic, message) {
    // Handle rawtx events
    if (topic.toString() === "rawtx") {
      const tx = bitcoin.Transaction.fromHex(message);
      // Watch for transactions that pay to carol's address
      tx.outs.forEach((output) => {
        const p = getPayment(output);
        if (p.address === carol[1].p2pkh)
          console.log("Payment to carol", {
            txid: tx.getId(),
            address: p.address,
            amount: output.value,
          });
      });
    }
  });

  // Mine a block every minute
  setInterval(() => {
    regtestUtils.mine(1);
  }, 60 * 1000);

  // Make sure we have a balance
  await wallet.sync();
  if (wallet.balance < 10e8) {
    await regtestUtils.faucet(wallet.address, 10e8);
    await regtestUtils.mine(1);
  }

  // Send some money to carol
  // TODO: wallet bug when not enough funds are there because some funds are pending
  await wallet.send(carol[1].p2pkh, 10.525);
}

main().catch(console.error);
