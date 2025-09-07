const hre = require('hardhat');
require('dotenv').config();

async function main() {
  const NAME = 'DUBAI AI';
  const SYMBOL = 'DBAI';

  const OWNER = process.env.OWNER_ADDRESS; // will receive full initial supply and own the contract
  const CHARITY = process.env.CHARITY_WALLET_ADDRESS; // fee receiver (1%)
  let PK = process.env.PRIVATE_KEY || '';
  if (!PK) throw new Error('PRIVATE_KEY missing in .env');
  if (!PK.startsWith('0x')) PK = '0x' + PK;

  if (!OWNER || !CHARITY) {
    throw new Error('Please set OWNER_ADDRESS and CHARITY_WALLET_ADDRESS in .env');
  }

  // 1,000,000,000 * 10^18
  const initialSupply = hre.ethers.parseUnits('1000000000', 18);

  const provider = hre.ethers.provider;
  const deployer = new hre.ethers.Wallet(PK, provider);
  console.log('Deployer:', await deployer.getAddress());

  const DBAI = await hre.ethers.getContractFactory('DBAI', deployer);
  const dbai = await DBAI.deploy(NAME, SYMBOL, OWNER, CHARITY, initialSupply);
  await dbai.waitForDeployment();

  const address = await dbai.getAddress();
  console.log('DBAI deployed at:', address);
  console.log('Verify with:');
  console.log('  npx hardhat verify --network bsc', address, `'${NAME}' '${SYMBOL}' ${OWNER} ${CHARITY} ${initialSupply.toString()}`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
