import { UniswapV2ProviderConfiguration } from 'src/features/on-chain/calculation-manager/providers/dexes/common/uniswap-v2-abstract/models/uniswap-v2-provider-configuration';
import { BLOCKCHAIN_NAME } from 'src/core/blockchain/models/blockchain-name';
import { wrappedNativeTokensList } from 'src/common/tokens';

const defaultKavaRoutingProvidersAddresses = [
    wrappedNativeTokensList[BLOCKCHAIN_NAME.KAVA].address, // WKAVA
    '0x765277eebeca2e31912c9946eae1021199b39c61', // DAI
    '0xE3F5a90F9cb311505cd691a46596599aA1A0AD7D', // ETH
    '0xab4e4bbb6d207b341cb5edbfa497d17ff5afa4d4', // JPT
    '0xfa9343c3897324496a05fc75abed6bac29f8a40f', // USDC
    '0xb44a9b6905af7c801311e8f4e76932ee959c663c', // USDT
    '0x818ec0a7fe18ff94269904fced6ae3dae6d6dc0b' // WBTC
];

const defaultKavaWethAddress = wrappedNativeTokensList[BLOCKCHAIN_NAME.KAVA].address;

export const defaultKavaProviderConfiguration: UniswapV2ProviderConfiguration = {
    maxTransitTokens: 3,
    routingProvidersAddresses: defaultKavaRoutingProvidersAddresses,
    wethAddress: defaultKavaWethAddress
};

export const kavaProviderConfiguration: UniswapV2ProviderConfiguration = {
    ...defaultKavaProviderConfiguration,
    routingProvidersAddresses: [
        ...defaultKavaRoutingProvidersAddresses,
        '0xeEeEEb57642040bE42185f49C52F7E9B38f8eeeE', // ELK
        '0x0f428d528b4f00c82a8ad032580d605cf5f122ee' // TIDE
    ]
};
