import { wrappedNativeTokensList } from 'src/common/tokens/constants/wrapped-native-tokens';
import { BLOCKCHAIN_NAME } from 'src/core/blockchain/models/blockchain-name';
import { UniswapV2ProviderConfiguration } from 'src/features/on-chain/calculation-manager/providers/dexes/common/uniswap-v2-abstract/models/uniswap-v2-provider-configuration';

const defaultAstarEvmRoutingProvidersAddresses = [
    wrappedNativeTokensList[BLOCKCHAIN_NAME.ASTAR_EVM]!.address, // WASTR
    '0xefaeee334f0fd1712f9a8cc375f427d9cdd40d73', // mUSDT
    '0x3795c36e7d12a8c252a20c5a7b455f7c57b60283', // ceUSDT
    '0xffffffff000000000000000000000001000007c0', // USDT

    '0xfa9343c3897324496a05fc75abed6bac29f8a40f', // mUSDC
    '0x6a2d262d56735dba19dd70682b39f6be9a931d98', // ceUSDC

    '0x6de33698e9e9b787e09d3bd7771ef63557e148bb', // DAI
    '0x4bf769b05e832fcdc9053fffbc78ca889acb5e1e' // BUSD
];

const defaultAstarEvmWethAddress = wrappedNativeTokensList[BLOCKCHAIN_NAME.ASTAR_EVM]!.address;

export const defaultAstarEvmProviderConfiguration: UniswapV2ProviderConfiguration = {
    maxTransitTokens: 2,
    routingProvidersAddresses: defaultAstarEvmRoutingProvidersAddresses,
    wethAddress: defaultAstarEvmWethAddress
};
