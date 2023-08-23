import { defaultBaseProviderConfiguration } from 'src/features/on-chain/calculation-manager/providers/dexes/base/default-constants';
import { UniswapV2ProviderConfiguration } from 'src/features/on-chain/calculation-manager/providers/dexes/common/uniswap-v2-abstract/models/uniswap-v2-provider-configuration';

export const BASE_SWAP_CONTRACT_ADDRESS = '0x327Df1E6de05895d2ab08513aaDD9313Fe505d86';

export const BASE_SWAP_PROVIDER_CONFIGURATION: UniswapV2ProviderConfiguration = {
    ...defaultBaseProviderConfiguration,
    maxTransitTokens: 2
};
