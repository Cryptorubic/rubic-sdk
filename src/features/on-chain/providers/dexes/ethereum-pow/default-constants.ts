import { UniswapV2ProviderConfiguration } from 'src/features/on-chain/providers/dexes/abstract/uniswap-v2-abstract/models/uniswap-v2-provider-configuration';

const defaultEthereumPowRoutingProvidersAddresses = [
    '0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2', // WETH
    '0xdac17f958d2ee523a2206206994597c13d831ec7', // USDT
    '0x6b175474e89094c44da98b954eedeac495271d0f', // DAI
    '0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48' // USDC
];

const defaultEthereumPowWethAddress = '0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2';

export const defaultEthereumPowProviderConfiguration: UniswapV2ProviderConfiguration = {
    maxTransitTokens: 1,
    routingProvidersAddresses: defaultEthereumPowRoutingProvidersAddresses,
    wethAddress: defaultEthereumPowWethAddress
};
