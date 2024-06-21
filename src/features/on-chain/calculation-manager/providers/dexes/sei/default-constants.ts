import { wrappedNativeTokensList } from 'src/common/tokens/constants/wrapped-native-tokens';
import { BLOCKCHAIN_NAME } from 'src/core/blockchain/models/blockchain-name';
import { UniswapV2ProviderConfiguration } from 'src/features/on-chain/calculation-manager/providers/dexes/common/uniswap-v2-abstract/models/uniswap-v2-provider-configuration';

const defaultSeiRoutingProvidersAddresses = [
    wrappedNativeTokensList[BLOCKCHAIN_NAME.SEI]!.address, // WSEI
    '0xb75d0b03c06a926e488e2659df1a861f860bd3d1', // USDT
    '0x3894085ef7ff0f0aedf52e2a2704928d1ec074f1' // USDC
];

const defaultSeiWethAddress = wrappedNativeTokensList[BLOCKCHAIN_NAME.SEI]!.address;

export const defaultSeiProviderConfiguration: UniswapV2ProviderConfiguration = {
    maxTransitTokens: 1,
    routingProvidersAddresses: defaultSeiRoutingProvidersAddresses,
    wethAddress: defaultSeiWethAddress
};
