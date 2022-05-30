import { UniswapV2ProviderConfiguration } from '@features/instant-trades/dexes/common/uniswap-v2-abstract/models/uniswap-v2-provider-configuration';

const defaultTelosRoutingProvidersAddresses = [
    '0xD102cE6A4dB07D247fcc28F366A623Df0938CA9E', // WTLOS
    '0xeFAeeE334F0Fd1712f9a8cc375f427D9Cdd40d73', // USDT
    '0x818ec0A7Fe18Ff94269904fCED6AE3DaE6d6dC0b', // USDC
    '0xf390830DF829cf22c53c8840554B98eafC5dCBc2', // BTC
    '0xfA9343C3897324496A05fC75abeD6bAC29f8A40f' // ETH
];

const defaultTelosWethAddress = '0xD102cE6A4dB07D247fcc28F366A623Df0938CA9E';

export const defaultTelosProviderConfiguration: UniswapV2ProviderConfiguration = {
    maxTransitTokens: 1,
    routingProvidersAddresses: defaultTelosRoutingProvidersAddresses,
    wethAddress: defaultTelosWethAddress
};
