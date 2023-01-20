import { wrappedNativeTokensList } from 'src/common/tokens';
import { BLOCKCHAIN_NAME } from 'src/core/blockchain/models/blockchain-name';
import { UniswapV2ProviderConfiguration } from 'src/features/on-chain/calculation-manager/providers/dexes/common/uniswap-v2-abstract/models/uniswap-v2-provider-configuration';

const defaultBobaRoutingProvidersAddresses = [
    wrappedNativeTokensList[BLOCKCHAIN_NAME.BOBA].address, // WETH
    '0xa18bf3994c0cc6e3b63ac420308e5383f53120d7', // BOBA
    '0x66a2a913e447d6b4bf33efbec43aaef87890fbbc', // USDC
    '0x5de1677344d3cb0d7d465c10b72a8f60699c062d', // USDT
    '0xf74195bb8a5cf652411867c5c2c5b8c2a402be35' // DAI
];

const defaultBobaWethAddress = wrappedNativeTokensList[BLOCKCHAIN_NAME.BOBA].address;

export const defaultBobaProviderConfiguration: UniswapV2ProviderConfiguration = {
    maxTransitTokens: 2,
    routingProvidersAddresses: defaultBobaRoutingProvidersAddresses,
    wethAddress: defaultBobaWethAddress
};
