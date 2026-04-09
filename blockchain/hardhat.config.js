require("@nomicfoundation/hardhat-toolbox");
require("dotenv").config();

const PRIVATE_KEY = process.env.PRIVATE_KEY || "0x0000000000000000000000000000000000000000000000000000000000000000";
const ALCHEMY_URL = process.env.ALCHEMY_URL || "";

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity: {
    version: "0.8.20",
    settings: {
      optimizer: {
        enabled: true,
        runs: 200,
      },
      viaIR: true,   // required to avoid "stack too deep" with large structs
    },
  },

  networks: {
    // Local Hardhat node (default)
    localhost: {
      url: "http://127.0.0.1:8545",
    },

    // Sepolia testnet via Alchemy
    sepolia: {
      url: ALCHEMY_URL,
      accounts: PRIVATE_KEY !== "0x0000000000000000000000000000000000000000000000000000000000000000"
        ? [PRIVATE_KEY]
        : [],
      chainId: 11155111,
    },
  },

  paths: {
    sources: "./contracts",
    tests: "./test",
    cache: "./cache",
    artifacts: "./artifacts",
  },

  // Verify contracts on Etherscan after deployment
  etherscan: {
    apiKey: process.env.ETHERSCAN_API_KEY || "",
  },
};
