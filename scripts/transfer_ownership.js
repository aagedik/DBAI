const { ethers } = require('hardhat');
require('dotenv').config();

/*
  Transfers DBAI ownership to a new owner (ideally a multisig like Gnosis Safe).

  Env vars:
    - CONTRACT_ADDRESS: Deployed DBAI token address
    - NEW_OWNER_ADDRESS: Target owner address
*/

async function main() {
  const tokenAddress = process.env.CONTRACT_ADDRESS;
  const newOwner = process.env.NEW_OWNER_ADDRESS;
  if (!tokenAddress || !newOwner) throw new Error('CONTRACT_ADDRESS and NEW_OWNER_ADDRESS are required');

  const [signer] = await ethers.getSigners();
  const dbai = await ethers.getContractAt('DBAI', tokenAddress, signer);

  const currentOwner = await dbai.owner();
  console.log('Current owner:', currentOwner);
  console.log('Transferring ownership to:', newOwner);

  const tx = await dbai.transferOwnership(newOwner);
  console.log('Tx sent:', tx.hash);
  await tx.wait();
  console.log('Ownership transferred. New owner should accept if Ownable2Step is used. (DBAI uses single-step Ownable).');
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
