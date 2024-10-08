import { wrappedNativeTokensList } from 'src/common/tokens/constants/wrapped-native-tokens';
import { BLOCKCHAIN_NAME } from 'src/core/blockchain/models/blockchain-name';

import { UniswapV3AlgebraProviderConfiguration } from '../../../common/uniswap-v3-algebra-abstract/models/uniswap-v3-algebra-provider-configuration';

export const CAMELOT_GRAVITY_PROVIDER_CONFIGURATION: UniswapV3AlgebraProviderConfiguration = {
    wethAddress: wrappedNativeTokensList[BLOCKCHAIN_NAME.GRAVITY]!.address,
    maxTransitTokens: 1
};
