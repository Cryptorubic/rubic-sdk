import { UniswapV2ProviderConfiguration } from 'src/features/on-chain/calculation-manager/providers/dexes/abstract/uniswap-v2-abstract/models/uniswap-v2-provider-configuration';
import { BLOCKCHAIN_NAME } from 'src/core/blockchain/models/blockchain-name';
import { wrappedNativeTokensList } from 'src/common/tokens';

const defaultMetisRoutingProvidersAddresses = [
    wrappedNativeTokensList[BLOCKCHAIN_NAME.METIS].address, // WMETIS
    '0xea32a96608495e54156ae48931a7c20f0dcc1a21', // m.USDC
    '0xbb06dca3ae6887fabf931640f67cab3e3a16f4dc', // m.USDT
    '0x721532bc0da5ffaeb0a6a45fb24271e8098629a7', // BYTE
    '0x420000000000000000000000000000000000000a', // WETH
    '0x90fe084f877c65e1b577c7b2ea64b8d8dd1ab278' // NETT
];

const defaultMetisWethAddress = wrappedNativeTokensList[BLOCKCHAIN_NAME.METIS].address;

export const defaultMetisProviderConfiguration: UniswapV2ProviderConfiguration = {
    maxTransitTokens: 2,
    routingProvidersAddresses: defaultMetisRoutingProvidersAddresses,
    wethAddress: defaultMetisWethAddress
};
