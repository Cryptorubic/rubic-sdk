import { defaultBaseProviderConfiguration } from 'src/features/on-chain/calculation-manager/providers/dexes/base/default-constants';
import { UniswapV2ProviderConfiguration } from 'src/features/on-chain/calculation-manager/providers/dexes/common/uniswap-v2-abstract/models/uniswap-v2-provider-configuration';

export const AERODROME_CONTRACT_ADDRESS = '0xcF77a3Ba9A5CA399B7c97c74d54e5b1Beb874E43';

export const AERODROME_PROVIDER_CONFIGURATION: UniswapV2ProviderConfiguration = {
    ...defaultBaseProviderConfiguration,
    maxTransitTokens: 1
};
