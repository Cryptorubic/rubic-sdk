import { UniswapV2ProviderConfiguration } from 'src/features/on-chain/providers/dexes/abstract/uniswap-v2-abstract/models/uniswap-v2-provider-configuration';

const defaultMoonriverRoutingProvidersAddresses = [
    '0xf50225a84382c74cbdea10b0c176f71fc3de0c4d', // WMOVR
    '0xB44a9B6905aF7c801311e8F4E76932ee959c663C', // USDT
    '0xE3F5a90F9cb311505cd691a46596599aA1A0AD7D', // USDC
    '0x80A16016cC4A2E6a2CACA8a4a498b1699fF0f844', // DAI
    '0x5D9ab5522c64E1F6ef5e3627ECCc093f56167818' // BUSD
];

const defaultMoonriverWethAddress = '0xf50225a84382c74cbdea10b0c176f71fc3de0c4d';

export const defaultMoonriverProviderConfiguration: UniswapV2ProviderConfiguration = {
    maxTransitTokens: 2,
    routingProvidersAddresses: defaultMoonriverRoutingProvidersAddresses,
    wethAddress: defaultMoonriverWethAddress
};
