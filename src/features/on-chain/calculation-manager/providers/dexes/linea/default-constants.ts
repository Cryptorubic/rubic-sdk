import { wrappedNativeTokensList } from 'src/common/tokens/constants/wrapped-native-tokens';
import { BLOCKCHAIN_NAME } from 'src/core/blockchain/models/blockchain-name';
import { UniswapV2ProviderConfiguration } from 'src/features/on-chain/calculation-manager/providers/dexes/common/uniswap-v2-abstract/models/uniswap-v2-provider-configuration';

const defaultLineaRoutingProvidersAddresses = [
    wrappedNativeTokensList[BLOCKCHAIN_NAME.LINEA]!.address, // WETH
    '0xf5C6825015280CdfD0b56903F9F8B5A2233476F5', // BNB
    '0x7d43AABC515C356145049227CeE54B608342c0ad', // BUSD
    '0x265b25e22bcd7f10a5bd6e6410f10537cc7567e8', // MATIC
    '0x0B1A02A7309dFbfAD1Cd4adC096582C87e8A3Ac1', // HZN
    '0x2140Ea50bc3B6Ac3971F9e9Ea93A1442665670e4' // NFTE
];

const defaultLineaWethAddress = wrappedNativeTokensList[BLOCKCHAIN_NAME.LINEA]!.address;

export const defaultLineaProviderConfiguration: UniswapV2ProviderConfiguration = {
    maxTransitTokens: 2,
    routingProvidersAddresses: defaultLineaRoutingProvidersAddresses,
    wethAddress: defaultLineaWethAddress
};
