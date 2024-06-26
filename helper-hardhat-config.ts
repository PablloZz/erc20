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

export { networkConfig };
