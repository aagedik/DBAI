// Usage:
//   node scripts/sign_message.js "<MESSAGE EXACTLY AS SHOWN BY BSCSCAN>"
//
// Signs an arbitrary message using PRIVATE_KEY from .env and prints the signature.
// Paste the signature into BscScan's "Verify Address Ownership" form.

require('dotenv').config();
const { ethers } = require('hardhat');

async function main() {
  let pk = process.env.PRIVATE_KEY || '';
  if (!pk) throw new Error('PRIVATE_KEY missing in .env');
  if (!pk.startsWith('0x')) pk = '0x' + pk;

  const msg = process.argv.slice(2).join(' ');
  if (!msg || msg.trim().length === 0) {
    console.error('Please provide the exact message to sign as a CLI argument.');
    console.error('Example:');
    console.error('  node scripts/sign_message.js "I hereby verify that I am the owner of ..."');
    process.exit(1);
  }

  const wallet = new ethers.Wallet(pk);
  const signature = await wallet.signMessage(msg);

  console.log('Address:', await wallet.getAddress());
  console.log('Message:');
  console.log(msg);
  console.log('\nSignature:');
  console.log(signature);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
