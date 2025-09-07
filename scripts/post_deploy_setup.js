const { ethers } = require('hardhat');
require('dotenv').config();

/*
  Post-deployment steps to prepare for PancakeSwap listing safely.

  What this script does:
  - Optionally set fee-exempt for router and known system addresses
  - Optionally set fee-exempt for the LP Pair (if already known)
  - Enable trading (one-way) when ready

  Env vars:
    - CONTRACT_ADDRESS: Deployed DBAI token address
    - OWNER_ADDRESS: Current owner address (must be the signer or signer must be owner)
    - PANCAKE_ROUTER: Pancake Router (v2) address on BSC mainnet (default provided)
    - LP_PAIR_ADDRESS: (optional) The created Pair address, if already known
    - ENABLE_TRADING: 'true' to call enableTrading()
    - EXEMPT_ADDRESSES: Comma-separated addresses to mark fee-exempt (optional)

  Notes:
    - PancakeSwap v2 Router on BSC mainnet: 0x10ED43C718714eb63d5aA57B78B54704E256024E
*/

async function main() {
  const tokenAddress = process.env.CONTRACT_ADDRESS;
  const router = process.env.PANCAKE_ROUTER || '0x10ED43C718714eb63d5aA57B78B54704E256024E';
  const pair = process.env.LP_PAIR_ADDRESS || '';
  const enableTrading = (process.env.ENABLE_TRADING || 'false').toLowerCase() === 'true';
  const extraExemptsRaw = process.env.EXEMPT_ADDRESSES || '';

  if (!tokenAddress) throw new Error('CONTRACT_ADDRESS is required');

  const [signer] = await ethers.getSigners();
  const dbai = await ethers.getContractAt('DBAI', tokenAddress, signer);

  const toExempt = [router];
  if (pair) toExempt.push(pair);
  const extra = extraExemptsRaw.split(',').map((s) => s.trim()).filter(Boolean);
  toExempt.push(...extra);

  // Set fee exemptions
  for (const addr of toExempt) {
    try {
      const isExempt = await dbai.isFeeExempt(addr);
      if (!isExempt) {
        const tx = await dbai.setFeeExempt(addr, true);
        await tx.wait();
        console.log('Fee exempt set:', addr);
      } else {
        console.log('Already fee exempt:', addr);
      }
    } catch (e) {
      console.log('Skipping setFeeExempt for', addr, '-', e.message);
    }
  }

  if (enableTrading) {
    try {
      const tx = await dbai.enableTrading();
      await tx.wait();
      console.log('Trading enabled.');
    } catch (e) {
      console.log('enableTrading failed (maybe already enabled):', e.message);
    }
  } else {
    console.log('ENABLE_TRADING not set to true; trading remains disabled.');
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
