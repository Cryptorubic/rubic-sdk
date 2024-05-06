import { wrappedNativeTokensList } from 'src/common/tokens/constants/wrapped-native-tokens';
import { BLOCKCHAIN_NAME } from 'src/core/blockchain/models/blockchain-name';
import { UniswapV2ProviderConfiguration } from 'src/features/on-chain/calculation-manager/providers/dexes/common/uniswap-v2-abstract/models/uniswap-v2-provider-configuration';

const defaultBlastRoutingProvidersAddresses = [
    wrappedNativeTokensList[BLOCKCHAIN_NAME.BLAST]!.address, // WETH
    '0xeb466342c4d449bc9f53a865d5cb90586f405215', // axlUSDC
    '0x1a35ee4640b0a3b87705b0a4b45d227ba60ca2ad', // axlWBTC
    '0xF7bc58b8D8f97ADC129cfC4c9f45Ce3C0E1D2692' // WBTC
];

const defaultBlastWethAddress = wrappedNativeTokensList[BLOCKCHAIN_NAME.BLAST]!.address;

export const defaultBlastProviderConfiguration: UniswapV2ProviderConfiguration = {
    maxTransitTokens: 2,
    routingProvidersAddresses: defaultBlastRoutingProvidersAddresses,
    wethAddress: defaultBlastWethAddress
};
