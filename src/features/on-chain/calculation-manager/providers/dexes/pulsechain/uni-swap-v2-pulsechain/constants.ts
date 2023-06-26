import { UniswapV2ProviderConfiguration } from 'src/features/on-chain/calculation-manager/providers/dexes/common/uniswap-v2-abstract/models/uniswap-v2-provider-configuration';
import { defaultPulsechainProviderConfiguration } from 'src/features/on-chain/calculation-manager/providers/dexes/pulsechain/default-constants';

export const UNISWAP_V2_PULSECHAIN_CONTRACT_ADDRESS = '0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D';

export const UNISWAP_V2_PULSECHAIN_PROVIDER_CONFIGURATION: UniswapV2ProviderConfiguration = {
    ...defaultPulsechainProviderConfiguration,
    maxTransitTokens: 2
};
