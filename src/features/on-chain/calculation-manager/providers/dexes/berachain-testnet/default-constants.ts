import { wrappedNativeTokensList } from 'src/common/tokens/constants/wrapped-native-tokens';
import { BLOCKCHAIN_NAME } from 'src/core/blockchain/models/blockchain-name';
import { UniswapV2ProviderConfiguration } from 'src/features/on-chain/calculation-manager/providers/dexes/common/uniswap-v2-abstract/models/uniswap-v2-provider-configuration';

const defaultBerachainTestnetRoutingProvidersAddresses = [
    wrappedNativeTokensList[BLOCKCHAIN_NAME.BERACHAIN]!.address, // WBERA
    '0x7eeca4205ff31f947edbd49195a7a88e6a91161b', // HONEY
    '0x6581e59a1c8da66ed0d313a0d4029dce2f746cc5' // USDC
];

const defaultBerachainTestnetWethAddress =
    wrappedNativeTokensList[BLOCKCHAIN_NAME.BERACHAIN]!.address;

export const defaultBerachainTestnetProviderConfiguration: UniswapV2ProviderConfiguration = {
    maxTransitTokens: 1,
    routingProvidersAddresses: defaultBerachainTestnetRoutingProvidersAddresses,
    wethAddress: defaultBerachainTestnetWethAddress
};
