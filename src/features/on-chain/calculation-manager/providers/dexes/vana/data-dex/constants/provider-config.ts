import { wrappedNativeTokensList } from 'src/common/tokens/constants/wrapped-native-tokens';
import { BLOCKCHAIN_NAME } from 'src/core/blockchain/models/blockchain-name';

import { UniswapV3AlgebraProviderConfiguration } from '../../../common/uniswap-v3-algebra-abstract/models/uniswap-v3-algebra-provider-configuration';

export const DATA_DEX_ROUTER_CONTRACT_ADDRESS = '0xeb40cbe65764202E28BcdB1e318adFdF8b2f2A3b';
export const DATA_DEX_QUOTER_CONTRACT_ADDRESS = '0x1b13728ea3C90863990aC0e05987CfeC1888908c';
export const DATA_DEX_FACTORY_CRONTRACT_ADDRESS = '0xc2a0d530e57B1275fbce908031DA636f95EA1E38';

export const DATA_DEX_PROVIDER_CONFIGURATION: UniswapV3AlgebraProviderConfiguration = {
    wethAddress: wrappedNativeTokensList[BLOCKCHAIN_NAME.VANA]!.address,
    maxTransitTokens: 1
};
