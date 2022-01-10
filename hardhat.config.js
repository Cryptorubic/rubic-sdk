/**
 * @type import('hardhat/config').HardhatUserConfig
 */
require('@nomiclabs/hardhat-web3');
require('./__tests__/env');

module.exports = {
  solidity: "0.7.3",
  networks: {
    hardhat: {
      forking: {
        url: global.sdkEnv.providers.ETH.jsonRpcUrl,
        blockNumber: global.sdkEnv.providers.ETH.blockNumber
      },
      chainId: 1
    }
  }
};
