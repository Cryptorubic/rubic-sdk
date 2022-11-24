import { UniswapV2ProviderConfiguration } from 'src/features/on-chain/calculation-manager/providers/dexes/common/uniswap-v2-abstract/models/uniswap-v2-provider-configuration';
import { BLOCKCHAIN_NAME } from 'src/core/blockchain/models/blockchain-name';
import { wrappedNativeTokensList } from 'src/common/tokens';

const defaultDFKRoutingProvidersAddresses = [
    wrappedNativeTokensList[BLOCKCHAIN_NAME.DFK].address // WJEWEL
];

const defaultDFKWethAddress = wrappedNativeTokensList[BLOCKCHAIN_NAME.DFK].address;

export const defaultDFKProviderConfiguration: UniswapV2ProviderConfiguration = {
    maxTransitTokens: 2,
    routingProvidersAddresses: defaultDFKRoutingProvidersAddresses,
    wethAddress: defaultDFKWethAddress
};
