/**
 * @type import('hardhat/config').HardhatUserConfig
 */
require('@nomiclabs/hardhat-web3');

module.exports = {
  solidity: "0.7.3",
  networks: {
    hardhat: {
      forking: {
        url: 'https://eth-mainnet.alchemyapi.io/v2/bl63SsjT8SkyVWu2a8Ip9nx5wB7IqPs2',
        blockNumber: 13961175
      },
      chainId: 1
    }
  }
};
