const bitcoin = require("bitcoinjs-lib");
const { alice, bob } = require("./wallets.json");
const { RegtestUtils } = require("regtest-client");
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
  const psbt = new bitcoin.Psbt({ network });
  await psbt.addInput({
    hash: "b27a1ca7df882c88144cafa482163b1e587ab2f31805cc419b084361e5fcd8bd",
    index: 0,
    witnessUtxo: {
      script: Buffer.from("0014" + alice[1].pubKeyHash, "hex"),
      value: 50e8,
    },
  });
  await psbt.addOutput({
    address: bob[1].p2pkh,
    value: 50e8 - 1000,
  });
  // await psbt.addOutput({
  //   address: alice[1].p2wpkh,
  //   value: 12e8 - 1000,
  // });
  psbt.signInput(0, keyPairAlice1);
  psbt.validateSignaturesOfInput(0);
  psbt.finalizeAllInputs();
  console.log("Transaction hexadecimal:");
  const tx = psbt.extractTransaction().toHex();
  console.log(tx);
  await regtestUtils.broadcast(tx);
  await regtestUtils.mine(6);
}

main().catch(console.error);
