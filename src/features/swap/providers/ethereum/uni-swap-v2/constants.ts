import { UniswapV2ProviderConfiguration } from '@features/swap/providers/common/uniswap-v2-abstract-provider/models/uniswap-v2-provider-configuration';
import { defaultEthereumProviderConfiguration } from '@features/swap/providers/ethereum/default-constants';

export const UNISWAP_V2_PROVIDER_CONFIGURATION: UniswapV2ProviderConfiguration = {
    ...defaultEthereumProviderConfiguration,
    maxTransitTokens: 2
};
