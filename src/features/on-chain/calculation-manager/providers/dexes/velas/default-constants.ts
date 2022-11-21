import { UniswapV2ProviderConfiguration } from 'src/features/on-chain/calculation-manager/providers/dexes/abstract/uniswap-v2-abstract/models/uniswap-v2-provider-configuration';
import { BLOCKCHAIN_NAME } from 'src/core/blockchain/models/blockchain-name';
import { wrappedNativeTokensList } from 'src/common/tokens';

const defaultVelasRoutingProvidersAddresses = [
    wrappedNativeTokensList[BLOCKCHAIN_NAME.VELAS].address, // WVLX
    '0x40c8002c2887ade2297ad48d9dc101de08bd104c', // WAG
    '0xdf44aed1684b9cfd0fbe07c43a3bbcd20cde0145' // USDV (USD Velero Stablecoin)
];

const defaultVelasWethAddress = wrappedNativeTokensList[BLOCKCHAIN_NAME.VELAS].address;

export const defaultVelasProviderConfiguration: UniswapV2ProviderConfiguration = {
    maxTransitTokens: 2,
    routingProvidersAddresses: defaultVelasRoutingProvidersAddresses,
    wethAddress: defaultVelasWethAddress
};
