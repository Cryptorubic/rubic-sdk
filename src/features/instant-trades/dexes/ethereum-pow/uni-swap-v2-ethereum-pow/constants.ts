import { defaultEthereumPowProviderConfiguration } from 'src/features/instant-trades/dexes/ethereum-pow/default-constants';
import { UniswapV2ProviderConfiguration } from 'src/features/instant-trades/dexes/common/uniswap-v2-abstract/models/uniswap-v2-provider-configuration';

export const UNISWAP_V2_ETHEREUM_POW_CONTRACT_ADDRESS =
    '0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D';

export const UNISWAP_V2_ETHEREUM_POW_PROVIDER_CONFIGURATION: UniswapV2ProviderConfiguration = {
    ...defaultEthereumPowProviderConfiguration,
    maxTransitTokens: 2
};
