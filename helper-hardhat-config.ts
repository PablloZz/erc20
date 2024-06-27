import { ethers } from "ethers";

type NetworkConfigItem = {
  blockConfirmations: number;
};

type NetworkConfigInfo = {
  [key: string]: NetworkConfigItem;
};

const networkConfig: NetworkConfigInfo = {
  localhost: {
    blockConfirmations: 1,
  },
  hardhat: {
    blockConfirmations: 1,
  },
  sepolia: {
    blockConfirmations: 6,
  },
};

const developmentChains = ["hardhat", "localhost"];
const INITIAL_SUPPLY = ethers.parseEther("100").toString();

export { networkConfig, developmentChains, INITIAL_SUPPLY };
