import { UniswapV2ProviderConfiguration } from 'src/features/on-chain/calculation-manager/providers/dexes/abstract/uniswap-v2-abstract/models/uniswap-v2-provider-configuration';
import { BLOCKCHAIN_NAME } from 'src/core/blockchain/models/blockchain-name';
import { wrappedNativeTokensList } from 'src/common/tokens';

const defaultKlaytnRoutingProvidersAddresses = [
    wrappedNativeTokensList[BLOCKCHAIN_NAME.KLAYTN].address // WKLAYTN
];

const defaultKlaytnWethAddress = wrappedNativeTokensList[BLOCKCHAIN_NAME.KLAYTN].address;

export const defaultKlaytnProviderConfiguration: UniswapV2ProviderConfiguration = {
    maxTransitTokens: 2,
    routingProvidersAddresses: defaultKlaytnRoutingProvidersAddresses,
    wethAddress: defaultKlaytnWethAddress
};
