import { defaultBscProviderConfiguration } from 'src/features/on-chain/calculation-manager/providers/dexes/bsc/default-constants';
import { UniswapV2ProviderConfiguration } from 'src/features/on-chain/calculation-manager/providers/dexes/common/uniswap-v2-abstract/models/uniswap-v2-provider-configuration';

export const EDDY_FINANCE_BSC_PROVIDER_CONFIGURATION: UniswapV2ProviderConfiguration = {
    ...defaultBscProviderConfiguration,
    maxTransitTokens: 1
};
