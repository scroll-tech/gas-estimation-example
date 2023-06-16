import { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";

require("dotenv").config();
const {
  RPC_SCROLL,
  PRIVATE_KEY
} = process.env;

const config: HardhatUserConfig = {
  solidity: {
    version: "0.8.17",
    settings: {
      optimizer: {
        enabled: true,
        runs: 200
      },
      evmVersion: "london"
    }
  },
  networks: {
    scroll: {
      url: RPC_SCROLL,
      accounts: [`0x${PRIVATE_KEY}`]
    }
  },
  defaultNetwork: "scroll"
};

export default config;
