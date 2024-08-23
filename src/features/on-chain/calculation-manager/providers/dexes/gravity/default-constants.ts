import { wrappedNativeTokensList } from 'src/common/tokens/constants/wrapped-native-tokens';
import { BLOCKCHAIN_NAME } from 'src/core/blockchain/models/blockchain-name';

import { UniswapV2ProviderConfiguration } from '../common/uniswap-v2-abstract/models/uniswap-v2-provider-configuration';

const defaultGravityRoutingProvidersAddresses = [
    wrappedNativeTokensList[BLOCKCHAIN_NAME.GRAVITY]!.address, // WG
    '0xFbDa5F676cB37624f28265A144A48B0d6e87d3b6', // USDC
    '0x816e810f9f787d669fb71932deabf6c83781cd48', // USDT
    '0x729ed87bbe7b7e4b7f09bcb9c668580818d98bb9', // WBTC
    '0xf6f832466cd6c21967e0d954109403f36bc8ceaa' // WETH
];

const defaultGravityWethAddress = wrappedNativeTokensList[BLOCKCHAIN_NAME.GRAVITY]!.address;

export const defaultzGravityProviderConfiguration: UniswapV2ProviderConfiguration = {
    maxTransitTokens: 1,
    routingProvidersAddresses: defaultGravityRoutingProvidersAddresses,
    wethAddress: defaultGravityWethAddress
};
