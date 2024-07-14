import "@nomicfoundation/hardhat-toolbox";
import * as dotenv from "dotenv";
import { HardhatUserConfig } from "hardhat/config";

dotenv.config();
const { PRIVATE_KEY, INFURA_API_KEY, LINEASCAN_API_KEY } = process.env;

if (!PRIVATE_KEY || !INFURA_API_KEY || !LINEASCAN_API_KEY) {
  throw new Error(
    "Please set your PRIVATE_KEY, INFURA_API_KEY, LINEASCAN_API_KEY, and POLYGONSCAN_API_KEY in a .env file",
  );
}

const config: HardhatUserConfig = {
  solidity: "0.8.20",
  networks: {
    polygon_amoy: {
      url: `https://rpc-amoy.polygon.technology`,
      chainId: 80002,
      accounts: [PRIVATE_KEY],
    },
    polygon_mainnet: {
      url: `https://polygon-mainnet.infura.io/v3/${INFURA_API_KEY}`,
      accounts: [PRIVATE_KEY],
    },
  },
  etherscan: {
    apiKey: {
      linea_mainnet: LINEASCAN_API_KEY,
      polygon_amoy: "D44TDITCGFHCYVXIV2V56C8H69AFWVSK6M",
    },
    customChains: [
      {
        network: "linea_mainnet",
        chainId: 59144,
        urls: {
          apiURL: "https://api.lineascan.build/api",
          browserURL: "https://lineascan.build/",
        },
      },
      {
        network: "polygon_amoy",
        chainId: 80002,
        urls: {
          apiURL: "https://api-amoy.polygonscan.com/api",
          browserURL: "https://amoy.polygonscan.com/",
        },
      },
      {
        network: "polygonMumbai",
        chainId: 80001,
        urls: {
          apiURL: "https://api-testnet.polygonscan.com/api",
          browserURL: "https://mumbai.polygonscan.com/",
        },
      },
    ],
  },
};

export default config;
