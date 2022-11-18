import { UniswapV2ProviderConfiguration } from 'src/features/on-chain/calculation-manager/providers/dexes/abstract/uniswap-v2-abstract/models/uniswap-v2-provider-configuration';
import { BLOCKCHAIN_NAME } from 'src/core/blockchain/models/blockchain-name';
import { wrappedNativeTokensList } from 'src/common/tokens';

const defaultEthereumPowRoutingProvidersAddresses = [
    wrappedNativeTokensList[BLOCKCHAIN_NAME.ETHEREUM_POW].address, // WETH
    '0xdac17f958d2ee523a2206206994597c13d831ec7', // USDT
    '0x6b175474e89094c44da98b954eedeac495271d0f', // DAI
    '0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48' // USDC
];

const defaultEthereumPowWethAddress = wrappedNativeTokensList[BLOCKCHAIN_NAME.ETHEREUM_POW].address;

export const defaultEthereumPowProviderConfiguration: UniswapV2ProviderConfiguration = {
    maxTransitTokens: 1,
    routingProvidersAddresses: defaultEthereumPowRoutingProvidersAddresses,
    wethAddress: defaultEthereumPowWethAddress
};
