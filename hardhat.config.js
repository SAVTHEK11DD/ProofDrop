require("@nomicfoundation/hardhat-toolbox");
require("dotenv").config();

const SEPOLIA_RPC_URL = process.env.SEPOLIA_RPC_URL || "";
const PRIVATE_KEY = process.env.PRIVATE_KEY || "";

if (process.env.HARDHAT_NETWORK === "sepolia") {
  if (!SEPOLIA_RPC_URL) {
    throw new Error("Missing SEPOLIA_RPC_URL in .env");
  }

  if (!PRIVATE_KEY) {
    throw new Error("Missing PRIVATE_KEY in .env");
  }
}

module.exports = {
  solidity: "0.8.28",
  networks: {
    sepolia: {
      url: SEPOLIA_RPC_URL,
      accounts: PRIVATE_KEY ? [PRIVATE_KEY] : [],
    },
  },
};
