import { wrappedAddress } from 'src/common/tokens/constants/wrapped-addresses';
import { BLOCKCHAIN_NAME } from 'src/core/blockchain/models/blockchain-name';

import { UniswapV3AlgebraProviderConfiguration } from '../../../common/uniswap-v3-algebra-abstract/models/uniswap-v3-algebra-provider-configuration';

export const UNI_SWAP_V3_FLARE_PROVIDER_CONFIGURATION: UniswapV3AlgebraProviderConfiguration = {
    maxTransitTokens: 1,
    wethAddress: wrappedAddress[BLOCKCHAIN_NAME.FLARE]!
};
