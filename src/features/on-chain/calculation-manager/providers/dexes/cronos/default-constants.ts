import { wrappedNativeTokensList } from 'src/common/tokens/constants/wrapped-native-tokens';
import { BLOCKCHAIN_NAME } from 'src/core/blockchain/models/blockchain-name';
import { UniswapV2ProviderConfiguration } from 'src/features/on-chain/calculation-manager/providers/dexes/common/uniswap-v2-abstract/models/uniswap-v2-provider-configuration';

const defaultCronosRoutingProvidersAddresses = [
    wrappedNativeTokensList[BLOCKCHAIN_NAME.CRONOS]!.address, // WCRO
    '0x66e428c3f67a68878562e79a0234c1f83c208770', // USDT
    '0xc21223249CA28397B4B6541dfFaEcC539BfF0c59', // USDC
    '0xfa9343c3897324496a05fc75abed6bac29f8a40f', // BNB,
    '0x0e517979c2c1c1522ddb0c73905e0d39b3f990c0', // ADA
    '0x1a8e39ae59e5556b56b76fcba98d22c9ae557396', // DOGE
    '0xf78a326ACd53651F8dF5D8b137295e434B7c8ba5', // MATIC,
    '0x062e66477faf219f25d27dced647bf57c3107d52', // WBTC
    '0xf2001b145b43032aaf5ee2884e456ccd805f677d' // DAI
];

export const defaultCronosProviderConfiguration: UniswapV2ProviderConfiguration = {
    maxTransitTokens: 2,
    routingProvidersAddresses: defaultCronosRoutingProvidersAddresses,
    wethAddress: wrappedNativeTokensList[BLOCKCHAIN_NAME.CRONOS]!.address
};

export const cronosProviderConfiguration: UniswapV2ProviderConfiguration = {
    ...defaultCronosProviderConfiguration,
    routingProvidersAddresses: defaultCronosRoutingProvidersAddresses
};
