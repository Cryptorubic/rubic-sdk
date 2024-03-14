import { wrappedNativeTokensList } from 'src/common/tokens/constants/wrapped-native-tokens';
import { BLOCKCHAIN_NAME } from 'src/core/blockchain/models/blockchain-name';
import { UniswapV2ProviderConfiguration } from 'src/features/on-chain/calculation-manager/providers/dexes/common/uniswap-v2-abstract/models/uniswap-v2-provider-configuration';

const defaultPulsechainRoutingProvidersAddresses = [
    wrappedNativeTokensList[BLOCKCHAIN_NAME.PULSECHAIN]!.address, // WPLS
    '0xefD766cCb38EaF1dfd701853BFCe31359239F305', // DAI
    '0x15D38573d2feeb82e7ad5187aB8c1D52810B1f07', // USDC
    '0x0Cb6F5a34ad42ec934882A05265A7d5F59b51A2f', // USDT
    '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2', // WETH
    '0x02DcdD04e3F455D838cd1249292C58f3B79e3C3C', // WETH
    '0x95b303987a60c71504d99aa1b13b4da07b0790ab' // PLSX
];

const defaultPulsechainWethAddress = wrappedNativeTokensList[BLOCKCHAIN_NAME.PULSECHAIN]!.address;

export const defaultPulsechainProviderConfiguration: UniswapV2ProviderConfiguration = {
    maxTransitTokens: 2,
    routingProvidersAddresses: defaultPulsechainRoutingProvidersAddresses,
    wethAddress: defaultPulsechainWethAddress
};
