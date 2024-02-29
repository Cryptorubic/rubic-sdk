import { wrappedNativeTokensList } from 'src/common/tokens/constants/wrapped-native-tokens';
import { BLOCKCHAIN_NAME } from 'src/core/blockchain/models/blockchain-name';
import { UniswapV2ProviderConfiguration } from 'src/features/on-chain/calculation-manager/providers/dexes/common/uniswap-v2-abstract/models/uniswap-v2-provider-configuration';

const defaultOasisRoutingProvidersAddresses = [
    wrappedNativeTokensList[BLOCKCHAIN_NAME.OASIS]!.address, // WROSE
    '0x94fbfFe5698DB6f54d6Ca524DbE673a7729014Be', // USDC
    '0x6Cb9750a92643382e020eA9a170AbB83Df05F30B', // USDT
    '0x2bF9b864cdc97b08B6D79ad4663e71B8aB65c45c', // DAI
    '0xdC19A122e268128B5eE20366299fc7b5b199C8e3', // weUSDT
    '0xf02b3e437304892105992512539F769423a515Cb' // YUZU
];

const defaultOasisWethAddress = wrappedNativeTokensList[BLOCKCHAIN_NAME.OASIS]!.address;

export const defaultOasisProviderConfiguration: UniswapV2ProviderConfiguration = {
    maxTransitTokens: 2,
    routingProvidersAddresses: defaultOasisRoutingProvidersAddresses,
    wethAddress: defaultOasisWethAddress
};
