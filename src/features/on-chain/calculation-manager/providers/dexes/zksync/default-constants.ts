import { wrappedNativeTokensList } from 'src/common/tokens/constants/wrapped-native-tokens';
import { BLOCKCHAIN_NAME } from 'src/core/blockchain/models/blockchain-name';
import { UniswapV2ProviderConfiguration } from 'src/features/on-chain/calculation-manager/providers/dexes/common/uniswap-v2-abstract/models/uniswap-v2-provider-configuration';

const defaultZkSyncRoutingProvidersAddresses = [
    wrappedNativeTokensList[BLOCKCHAIN_NAME.ZK_SYNC]!.address, // WETH
    '0x3355df6D4c9C3035724Fd0e3914dE96A5a83aaf4', // USDC
    '0x0e97c7a0f8b2c9885c8ac9fc6136e829cbc21d42' // MUTE
];

const defaultZkSyncWethAddress = wrappedNativeTokensList[BLOCKCHAIN_NAME.ZK_SYNC]!.address;

export const defaultZkSyncProviderConfiguration: UniswapV2ProviderConfiguration = {
    maxTransitTokens: 1,
    routingProvidersAddresses: defaultZkSyncRoutingProvidersAddresses,
    wethAddress: defaultZkSyncWethAddress
};
