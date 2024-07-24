import { wrappedNativeTokensList } from 'src/common/tokens/constants/wrapped-native-tokens';
import { BLOCKCHAIN_NAME } from 'src/core/blockchain/models/blockchain-name';

import { UniswapV2ProviderConfiguration } from '../../common/uniswap-v2-abstract/models/uniswap-v2-provider-configuration';
import { defaultBahamutProviderConfiguration } from '../default-constants';

export const UNI_SWAP_V2_BAHAMUT_CONTRACT_ADDRESS = '0x643b0bBdeD375aC581bE6Ff408F423c13402fC6D';

export const uniSwapV2BahamutRoutingProvidersAddresses = [
    wrappedNativeTokensList[BLOCKCHAIN_NAME.BAHAMUT]!.address, //WFTN
    '0xf0E753D9309BE96c2beEF7Cf524c99799b4FA6fc', //USDC.USDT
    '0xd0C1aE39D40DB875679a3329b2d5F71D5929c43f', //USDC.WFTN
    '0x3f6a26966F2Beb20117cC2370f75d3c736b5ce9e' //WFTN.USDT
];

export const UNI_SWAP_V2_BAHAMUT_PROVIDER_CONFIGURATION: UniswapV2ProviderConfiguration = {
    ...defaultBahamutProviderConfiguration,
    routingProvidersAddresses: uniSwapV2BahamutRoutingProvidersAddresses
};
