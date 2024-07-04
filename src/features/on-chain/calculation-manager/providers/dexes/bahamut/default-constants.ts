import { wrappedNativeTokensList } from 'src/common/tokens/constants/wrapped-native-tokens';
import { BLOCKCHAIN_NAME } from 'src/core/blockchain/models/blockchain-name';

import { UniswapV2ProviderConfiguration } from '../common/uniswap-v2-abstract/models/uniswap-v2-provider-configuration';

export const defaultBahamutRoutingProvidersAddresses = [
    wrappedNativeTokensList[BLOCKCHAIN_NAME.BAHAMUT]!.address, //WFTN
    '0xDeF886C55a79830C47108eeb9c37e78a49684e41', //USDT
    '0x4237e0a5b55233d5b6d6d1d9bf421723954130d8', //USDC
    '0xE5b3562A0fa9eC3e718C96FfE349e1280D2Be591' //WETH
];

const defaultBahamutWethAddress = wrappedNativeTokensList[BLOCKCHAIN_NAME.BAHAMUT]!.address;

export const defaultBahamutProviderConfiguration: UniswapV2ProviderConfiguration = {
    maxTransitTokens: 1,
    routingProvidersAddresses: defaultBahamutRoutingProvidersAddresses,
    wethAddress: defaultBahamutWethAddress
};
