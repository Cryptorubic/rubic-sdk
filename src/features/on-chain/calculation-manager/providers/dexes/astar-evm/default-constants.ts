import { wrappedNativeTokensList } from 'src/common/tokens';
import { BLOCKCHAIN_NAME } from 'src/core/blockchain/models/blockchain-name';
import { UniswapV2ProviderConfiguration } from 'src/features/on-chain/calculation-manager/providers/dexes/common/uniswap-v2-abstract/models/uniswap-v2-provider-configuration';

const defaultAstarEvmRoutingProvidersAddresses = [
    wrappedNativeTokensList[BLOCKCHAIN_NAME.ASTAR_EVM]!.address, // WASTR
    '', // USDT
    '', // USDC
    '', // DAI
    '' // BUSD
];

const defaultAstarEvmWethAddress = wrappedNativeTokensList[BLOCKCHAIN_NAME.ASTAR_EVM]!.address;

export const defaultAstarEvmProviderConfiguration: UniswapV2ProviderConfiguration = {
    maxTransitTokens: 2,
    routingProvidersAddresses: defaultAstarEvmRoutingProvidersAddresses,
    wethAddress: defaultAstarEvmWethAddress
};
