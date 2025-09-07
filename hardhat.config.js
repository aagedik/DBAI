require('dotenv').config();
require('@nomicfoundation/hardhat-toolbox');

let PRIVATE_KEY = process.env.PRIVATE_KEY || '';
if (PRIVATE_KEY && !PRIVATE_KEY.startsWith('0x')) {
  PRIVATE_KEY = '0x' + PRIVATE_KEY;
}
const ETHERSCAN_API_KEY = process.env.ETHERSCAN_API_KEY || process.env.BSCSCAN_API_KEY || '';

module.exports = {
  solidity: {
    version: '0.8.24',
    settings: {
      optimizer: { enabled: true, runs: 200 }
    }
  },
  networks: {
    bsc: {
      url: 'https://bsc-dataseed.binance.org',
      chainId: 56,
      accounts: PRIVATE_KEY ? [PRIVATE_KEY] : []
    }
  },
  sourcify: {
    enabled: false
  },
  etherscan: {
    apiKey: ETHERSCAN_API_KEY,
    customChains: [
      {
        network: 'bsc',
        chainId: 56,
        urls: {
          apiURL: 'https://api.bscscan.com/api',
          browserURL: 'https://bscscan.com'
        }
      }
    ]
  }
};
