import { wrappedNativeTokensList } from 'src/common/tokens';
import { BLOCKCHAIN_NAME } from 'src/core/blockchain/models/blockchain-name';
import { UniswapV2ProviderConfiguration } from 'src/features/on-chain/calculation-manager/providers/dexes/common/uniswap-v2-abstract/models/uniswap-v2-provider-configuration';

const defaultVelasRoutingProvidersAddresses = [
    wrappedNativeTokensList[BLOCKCHAIN_NAME.VELAS].address, // WVLX
    '0x40c8002c2887ade2297ad48d9dc101de08bd104c', // WAG
    '0xdf44aed1684b9cfd0fbe07c43a3bbcd20cde0145', // USDV (USD Velero Stablecoin)
    '0x3611fbfb06ffbcef9afb210f6ace86742e6c14a4', // ADA (Wrapped Cardano)
    '0x72eb7ca07399ec402c5b7aa6a65752b6a1dc0c27' // ASTRO (AstroSwap)
];

const defaultVelasWethAddress = wrappedNativeTokensList[BLOCKCHAIN_NAME.VELAS].address;

export const defaultVelasProviderConfiguration: UniswapV2ProviderConfiguration = {
    maxTransitTokens: 2,
    routingProvidersAddresses: defaultVelasRoutingProvidersAddresses,
    wethAddress: defaultVelasWethAddress
};
