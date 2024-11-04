import { wrappedNativeTokensList } from "src/common/tokens/constants/wrapped-native-tokens";
import { BLOCKCHAIN_NAME } from "src/core/blockchain/models/blockchain-name";
import { UniswapV2ProviderConfiguration } from "../common/uniswap-v2-abstract/models/uniswap-v2-provider-configuration";


const defaultFantomRoutingProvidersAddresses = [
    wrappedNativeTokensList[BLOCKCHAIN_NAME.FLARE]!.address, // WFLR
    '0x0b38e83b86d491735feaa0a791f65c2b99535396', // USDT
    '0xfbda5f676cb37624f28265a144a48b0d6e87d3b6', // USDC.e
    '0xe6505f92583103af7ed9974dec451a7af4e3a3be', // JOULE
    '0x12e605bc104e93b45e1ad99f9e555f659051c2bb', // sFLR
    '0xb5010d5eb31aa8776b52c7394b76d6d627501c73',  // PFL
    '0x90e157a979074f9f2fe8b124ba08e6f72dc812fc' // GFLR
];

const defaultFlareWethAddress = wrappedNativeTokensList[BLOCKCHAIN_NAME.FLARE]!.address;

export const defaultFlareProviderConfiguration: UniswapV2ProviderConfiguration = {
    maxTransitTokens: 2,
    routingProvidersAddresses: defaultFantomRoutingProvidersAddresses,
    wethAddress: defaultFlareWethAddress
};