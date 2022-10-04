import { UniswapV2ProviderConfiguration } from 'src/features/on-chain/providers/dexes/abstract/uniswap-v2-abstract/models/uniswap-v2-provider-configuration';
import { defaultEthereumProviderConfiguration } from 'src/features/on-chain/providers/dexes/ethereum/default-constants';

export const UNISWAP_V2_ETHEREUM_CONTRACT_ADDRESS = '0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D';

export const UNISWAP_V2_ETHEREUM_PROVIDER_CONFIGURATION: UniswapV2ProviderConfiguration = {
    ...defaultEthereumProviderConfiguration,
    maxTransitTokens: 2
};
