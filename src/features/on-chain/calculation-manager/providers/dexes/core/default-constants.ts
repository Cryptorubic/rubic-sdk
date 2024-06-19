import { wrappedNativeTokensList } from 'src/common/tokens/constants/wrapped-native-tokens';
import { BLOCKCHAIN_NAME } from 'src/core/blockchain/models/blockchain-name';
import { UniswapV2ProviderConfiguration } from 'src/features/on-chain/calculation-manager/providers/dexes/common/uniswap-v2-abstract/models/uniswap-v2-provider-configuration';

const defaultCoreRoutingProvidersAddresses = [
    wrappedNativeTokensList[BLOCKCHAIN_NAME.CORE]!.address, // WCORE
    '0x900101d06A7426441Ae63e9AB3B9b0F63Be145F1', // USDT
    '0x2297aEbD383787A160DD0d9F71508148769342E3', // BTCB
    '0xeAB3aC417c4d6dF6b143346a46fEe1B847B50296', // ETH
    '0xa4151B2B3e269645181dCcF2D426cE75fcbDeca9' // USDC
];

const defaultCoreWethAddress = wrappedNativeTokensList[BLOCKCHAIN_NAME.CORE]!.address;

const defaultCoreProviderConfiguration: UniswapV2ProviderConfiguration = {
    maxTransitTokens: 2,
    routingProvidersAddresses: defaultCoreRoutingProvidersAddresses,
    wethAddress: defaultCoreWethAddress
};
