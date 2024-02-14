import { wrappedNativeTokensList } from 'src/common/tokens/constants/wrapped-native-tokens';
import { BLOCKCHAIN_NAME } from 'src/core/blockchain/models/blockchain-name';
import { UniswapV2ProviderConfiguration } from 'src/features/on-chain/calculation-manager/providers/dexes/common/uniswap-v2-abstract/models/uniswap-v2-provider-configuration';

const defaultBaseRoutingProvidersAddresses = [
    wrappedNativeTokensList[BLOCKCHAIN_NAME.BASE]!.address, // WETH
    '0x2Ae3F1Ec7F1F5012CFEab0185bfc7aa3cf0DEc22', // cbETH
    '0xd9aAEc86B65D86f6A7B5B1b0c42FFA531710b6CA', // USDbC
    '0xB79DD08EA68A908A97220C76d19A6aA9cBDE4376', // USD+
    '0xEB466342C4d449BC9f53A865D5Cb90586f405215', // axlUSDb
    '0x78a087d713Be963Bf307b18F2Ff8122EF9A63ae9', // BSWAP
    '0x50c5725949A6F0c72E6C4a641F24049A917DB0Cb' // DAI
];

const defaultBaseWethAddress = wrappedNativeTokensList[BLOCKCHAIN_NAME.BASE]!.address;

export const defaultBaseProviderConfiguration: UniswapV2ProviderConfiguration = {
    maxTransitTokens: 2,
    routingProvidersAddresses: defaultBaseRoutingProvidersAddresses,
    wethAddress: defaultBaseWethAddress
};
