import { wrappedNativeTokensList } from 'src/common/tokens/constants/wrapped-native-tokens';
import { BLOCKCHAIN_NAME } from 'src/core/blockchain/models/blockchain-name';

import { UniswapV3AlgebraProviderConfiguration } from '../../../common/uniswap-v3-algebra-abstract/models/uniswap-v3-algebra-provider-configuration';

export const KODIAK_V3_ROUTER_CONTRACT_ADDRESS = '0xEd158C4b336A6FCb5B193A5570e3a571f6cbe690';
export const KODIAK_V3_PROVIDER_CONFIGURATION: UniswapV3AlgebraProviderConfiguration = {
    wethAddress: wrappedNativeTokensList[BLOCKCHAIN_NAME.BERACHAIN]!.address,
    maxTransitTokens: 1
};
