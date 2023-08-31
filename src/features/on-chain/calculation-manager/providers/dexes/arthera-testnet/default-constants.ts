import { wrappedNativeTokensList } from 'src/common/tokens';
import { BLOCKCHAIN_NAME } from 'src/core/blockchain/models/blockchain-name';
import { UniswapV2ProviderConfiguration } from 'src/features/on-chain/calculation-manager/providers/dexes/common/uniswap-v2-abstract/models/uniswap-v2-provider-configuration';

const defaultArtheraRoutingProvidersAddresses = [
    wrappedNativeTokensList[BLOCKCHAIN_NAME.ARTHERA]!.address, // WMATIC
    '0xEC250E6856e14A494cb1f0abC61d72348c79F418', // USDT
    '0x83D4a9Ea77a4dbA073cD90b30410Ac9F95F93E7C', // USDC
];

const defaultArtheraWethAddress = wrappedNativeTokensList[BLOCKCHAIN_NAME.ARTHERA]!.address;

export const defaultArtheraProviderConfiguration: UniswapV2ProviderConfiguration = {
    maxTransitTokens: 3,
    routingProvidersAddresses: defaultArtheraRoutingProvidersAddresses,
    wethAddress: defaultArtheraWethAddress
};
