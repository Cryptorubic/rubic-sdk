import { UniswapV2ProviderConfiguration } from 'src/features/instant-trades/dexes/common/uniswap-v2-abstract/models/uniswap-v2-provider-configuration';

const defaultArbitrumRoutingProvidersAddresses = [
    '0x82af49447d8a07e3bd95bd0d56f35241523fbab1', // WETH
    '0xfea7a6a0b346362bf88a9e4a88416b77a57d6c2a', // MIM
    '0x6c2c06790b3e3e3c38e12ee22f8183b37a13ee55', // DPX
    '0xff970a61a04b1ca14834a43f5de4533ebddb5cc8', // USDC
    '0x32eb7902d4134bf98a28b963d26de779af92a212', // RDPX
    '0x539bde0d7dbd336b79148aa742883198bbf60342' // MAGIC
];

const defaultArbitrumWethAddress = '0x82af49447d8a07e3bd95bd0d56f35241523fbab1';

export const defaultArbitrumProviderConfiguration: UniswapV2ProviderConfiguration = {
    maxTransitTokens: 1,
    routingProvidersAddresses: defaultArbitrumRoutingProvidersAddresses,
    wethAddress: defaultArbitrumWethAddress
};
