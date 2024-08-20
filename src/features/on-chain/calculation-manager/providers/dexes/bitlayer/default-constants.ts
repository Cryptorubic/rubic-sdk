import { wrappedNativeTokensList } from 'src/common/tokens/constants/wrapped-native-tokens';
import { BLOCKCHAIN_NAME } from 'src/core/blockchain/models/blockchain-name';
import { UniswapV2ProviderConfiguration } from 'src/features/on-chain/calculation-manager/providers/dexes/common/uniswap-v2-abstract/models/uniswap-v2-provider-configuration';

const defaulBitlayerWethAddress = wrappedNativeTokensList[BLOCKCHAIN_NAME.BITLAYER]!.address;

const defaultBitlayerRoutingProvidersAddresses = [
    defaulBitlayerWethAddress, // WBTC
    '0xf6718b2701d4a6498ef77d7c152b2137ab28b8a3', // stBTC
    '0xfe9f969faf8ad72a83b761138bf25de87eff9dd2', // USDT
    '0xef63d4e178b3180beec9b0e143e0f37f4c93f4c2', // ETH
    '0x9827431e8b77e87c9894bd50b055d6be56be0030', // USDC
    '0x2729868df87d062020e4a4867ff507fb52ee697c' // CBD
];

export const defaultBitlayerProviderConfiguration: UniswapV2ProviderConfiguration = {
    maxTransitTokens: 2,
    routingProvidersAddresses: defaultBitlayerRoutingProvidersAddresses,
    wethAddress: defaulBitlayerWethAddress
};
