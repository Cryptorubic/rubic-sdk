import { wrappedNativeTokensList } from 'src/common/tokens/constants/wrapped-native-tokens';
import { BLOCKCHAIN_NAME } from 'src/core/blockchain/models/blockchain-name';

import { UniswapV2ProviderConfiguration } from '../common/uniswap-v2-abstract/models/uniswap-v2-provider-configuration';

const defaultSoneiumRoutingProvidersAddresses = [
    wrappedNativeTokensList[BLOCKCHAIN_NAME.SONEIUM]!.address, // WETH
    '0x3A337a6adA9d885b6Ad95ec48F9b75f197b5AE35', // USDT
    '0xbA9986D2381edf1DA03B0B9c1f8b00dc4AacC369', // USDC.e
    '0x2CAE934a1e84F693fbb78CA5ED3B0A6893259441', // ASTR
    '0xf24e57b1cb00d98C31F04f86328e22E8fcA457fb', // SONE
    '0xc67476893C166c537afd9bc6bc87b3f228b44337' // NSASTR
];

const defaultSoneiumWethAddress = wrappedNativeTokensList[BLOCKCHAIN_NAME.SONEIUM]!.address;

export const defaultSoneiumProviderConfiguration: UniswapV2ProviderConfiguration = {
    maxTransitTokens: 1,
    routingProvidersAddresses: defaultSoneiumRoutingProvidersAddresses,
    wethAddress: defaultSoneiumWethAddress
};
