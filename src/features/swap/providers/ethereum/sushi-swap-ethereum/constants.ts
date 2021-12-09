import { UniswapV2ProviderConfiguration } from '@features/swap/providers/common/uniswap-v2-abstract-provider/models/uniswap-v2-provider-configuration';
import {
    defaultEthereumRoutingProvidersAddresses,
    defaultEthereumWethAddress
} from '@features/swap/providers/ethereum/default-constants';

export const SUSHI_SWAP_PROVIDER_CONFIGURATION: UniswapV2ProviderConfiguration = {
    maxTransitTokens: 1,
    routingProvidersAddresses: defaultEthereumRoutingProvidersAddresses,
    wethAddress: defaultEthereumWethAddress
};
