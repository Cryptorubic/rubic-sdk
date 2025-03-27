import { wrappedNativeTokensList } from 'src/common/tokens/constants/wrapped-native-tokens';
import { BLOCKCHAIN_NAME } from 'src/core/blockchain/models/blockchain-name';

import { UniswapV3AlgebraProviderConfiguration } from '../../../common/uniswap-v3-algebra-abstract/models/uniswap-v3-algebra-provider-configuration';

export const MEGAETH_TESTNET_ROUTER_CONTRACT_ADDRESS = '0xc063017B825091798E60e776Be426c54c10ceE0c';
export const MEGAETH_TESTNET_PROVIDER_CONFIGURATION: UniswapV3AlgebraProviderConfiguration = {
    wethAddress: wrappedNativeTokensList[BLOCKCHAIN_NAME.MEGAETH_TESTNET]!.address,
    maxTransitTokens: 1
};
