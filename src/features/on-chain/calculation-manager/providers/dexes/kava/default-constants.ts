import { UniswapV2ProviderConfiguration } from 'src/features/on-chain/calculation-manager/providers/dexes/abstract/uniswap-v2-abstract/models/uniswap-v2-provider-configuration';

const defaultKavaRoutingProvidersAddresses = [
    '0xc86c7C0eFbd6A49B35E8714C5f59D99De09A225b', // WKAVA
    '0x765277eebeca2e31912c9946eae1021199b39c61', // DAI
    '0xE3F5a90F9cb311505cd691a46596599aA1A0AD7D', // ETH
    '0xab4e4bbb6d207b341cb5edbfa497d17ff5afa4d4', // JPT
    '0xfa9343c3897324496a05fc75abed6bac29f8a40f', // USDC
    '0xb44a9b6905af7c801311e8f4e76932ee959c663c', // USDT
    '0x818ec0a7fe18ff94269904fced6ae3dae6d6dc0b' // WBTC
];

const defaultKavaWethAddress = '0xc86c7C0eFbd6A49B35E8714C5f59D99De09A225b';

export const defaultKavaProviderConfiguration: UniswapV2ProviderConfiguration = {
    maxTransitTokens: 3,
    routingProvidersAddresses: defaultKavaRoutingProvidersAddresses,
    wethAddress: defaultKavaWethAddress
};
