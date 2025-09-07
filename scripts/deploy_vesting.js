const { ethers } = require('hardhat');
require('dotenv').config();

/*
  Deploys sample LinearTokenVesting contracts for allocations that should be locked.
  IMPORTANT: This script only deploys vesting vaults. You must transfer allocated DBAI
  into each vesting contract address AFTER deployment.

  Env params:
    - VESTING_TOKEN_ADDRESS: Deployed DBAI token address
    - VESTING_START_TIMESTAMP: Unix seconds for vesting start
    - VESTING_CLIFF_SECONDS: Cliff duration in seconds (>= 365 days recommended)
    - VESTING_TOTAL_DURATION_SECONDS: Total vesting duration in seconds (> cliff)
    - BENEFICIARY_ADDRESSES: Comma-separated EVM addresses (examples allowed)

  Example (12 months cliff, 24 months duration total):
    VESTING_CLIFF_SECONDS=31536000
    VESTING_TOTAL_DURATION_SECONDS=63072000
*/

async function main() {
  const token = process.env.VESTING_TOKEN_ADDRESS;
  const start = Number(process.env.VESTING_START_TIMESTAMP);
  const cliff = Number(process.env.VESTING_CLIFF_SECONDS);
  const duration = Number(process.env.VESTING_TOTAL_DURATION_SECONDS);
  const beneficiariesRaw = process.env.BENEFICIARY_ADDRESSES || '';

  if (!token || !start || !cliff || !duration || !beneficiariesRaw) {
    throw new Error('Please set VESTING_TOKEN_ADDRESS, VESTING_START_TIMESTAMP, VESTING_CLIFF_SECONDS, VESTING_TOTAL_DURATION_SECONDS, BENEFICIARY_ADDRESSES in .env');
  }

  const beneficiaries = beneficiariesRaw.split(',').map((s) => s.trim()).filter(Boolean);
  if (beneficiaries.length === 0) {
    throw new Error('No beneficiaries provided');
  }

  const Vesting = await ethers.getContractFactory('LinearTokenVesting');

  const deployed = [];
  for (const addr of beneficiaries) {
    const vest = await Vesting.deploy(token, addr, start, cliff, duration);
    await vest.waitForDeployment();
    const vestAddr = await vest.getAddress();
    deployed.push({ beneficiary: addr, vesting: vestAddr });
    console.log(`Vesting deployed for ${addr}: ${vestAddr}`);
  }

  console.log('\nAll vesting contracts:');
  for (const v of deployed) {
    console.log(`- ${v.beneficiary}: ${v.vesting}`);
  }
  console.log('\nNext step: transfer allocated DBAI to each vesting contract address.');
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
