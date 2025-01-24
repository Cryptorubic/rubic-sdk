import { wrappedNativeTokensList } from 'src/common/tokens/constants/wrapped-native-tokens';
import { BLOCKCHAIN_NAME } from 'src/core/blockchain/models/blockchain-name';
import { UniswapV2ProviderConfiguration } from '../common/uniswap-v2-abstract/models/uniswap-v2-provider-configuration';

const defaultFraxtalRoutingProvidersAddresses = [
    wrappedNativeTokensList[BLOCKCHAIN_NAME.FRAXTAL]!.address, // wfrxETH
    '0xFc00000000000000000000000000000000000001', // FRAX
    '0xfc00000000000000000000000000000000000005', // sfrxETH
    '0xfc00000000000000000000000000000000000002', // FXS
    '0xfc00000000000000000000000000000000000008', // sFRAX
    '0xfc00000000000000000000000000000000000007', // frxBTC
    '0xfc00000000000000000000000000000000000003', // FPI
    '0xfc00000000000000000000000000000000000004', // FPIS
    '0x2416092f143378750bb29b79eD961ab195CcEea5', // ezETH
    '0x4d15EA9C2573ADDAeD814e48C148b5262694646A', // USDT
    '0xDcc0F2D8F90FDe85b10aC1c8Ab57dc0AE946A543' // USDC
];

const defaultFraxtalWethAddress = wrappedNativeTokensList[BLOCKCHAIN_NAME.FRAXTAL]!.address;

export const defaultFraxtalProviderConfiguration: UniswapV2ProviderConfiguration = {
    maxTransitTokens: 2,
    routingProvidersAddresses: defaultFraxtalRoutingProvidersAddresses,
    wethAddress: defaultFraxtalWethAddress
};
