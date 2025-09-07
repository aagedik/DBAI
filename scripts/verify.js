const hre = require('hardhat');

async function main() {
  const address = process.env.CONTRACT_ADDRESS;
  const NAME = 'DUBAI AI';
  const SYMBOL = 'DBAI';
  const OWNER = process.env.OWNER_ADDRESS;
  const CHARITY = process.env.CHARITY_WALLET_ADDRESS;
  const initialSupply = hre.ethers.parseUnits('1000000000', 18);

  if (!address || !OWNER || !CHARITY) {
    throw new Error('Please set CONTRACT_ADDRESS, OWNER_ADDRESS and CHARITY_WALLET_ADDRESS in .env');
  }

  await hre.run('verify:verify', {
    address,
    constructorArguments: [NAME, SYMBOL, OWNER, CHARITY, initialSupply]
  });
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
