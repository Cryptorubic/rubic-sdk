import { wrappedNativeTokensList } from 'src/common/tokens/constants/wrapped-native-tokens';
import { BLOCKCHAIN_NAME } from 'src/core/blockchain/models/blockchain-name';
import { UniswapV2ProviderConfiguration } from 'src/features/on-chain/calculation-manager/providers/dexes/common/uniswap-v2-abstract/models/uniswap-v2-provider-configuration';

const defaultBscWethAddress = wrappedNativeTokensList[BLOCKCHAIN_NAME.BINANCE_SMART_CHAIN]!.address;

const defaultBscRoutingProvidersAddresses = [
    defaultBscWethAddress, // WBNB
    '0x855fC87f7F14Db747ef27603b02bAe579ba947B6', // USDC
    '0x7d43AABC515C356145049227CeE54B608342c0ad', // USDT
    '0xC826C23327098cd8A37f140114F2173A8F62DD29', // WUSDT
    '0x9a01bf917477dd9f5d715d188618fc8b7350cd22' // BUSD
];

export const defaultBscTestnetProviderConfiguration: UniswapV2ProviderConfiguration = {
    maxTransitTokens: 3,
    routingProvidersAddresses: defaultBscRoutingProvidersAddresses,
    wethAddress: defaultBscWethAddress
};
