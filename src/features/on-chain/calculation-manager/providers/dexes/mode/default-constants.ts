import { wrappedNativeTokensList } from 'src/common/tokens/constants/wrapped-native-tokens';
import { BLOCKCHAIN_NAME } from 'src/core/blockchain/models/blockchain-name';
import { UniswapV2ProviderConfiguration } from 'src/features/on-chain/calculation-manager/providers/dexes/common/uniswap-v2-abstract/models/uniswap-v2-provider-configuration';

const defaultModeRoutingProvidersAddresses = [
    wrappedNativeTokensList[BLOCKCHAIN_NAME.MODE]!.address, // WETH
    '0xf0F161fDA2712DB8b566946122a5af183995e2eD', // USDT
    '0xd988097fb8612cc24eeC14542bC03424c656005f', // USDC
    '0xcDd475325D6F564d27247D1DddBb0DAc6fA0a5CF' // WBTC
];

const defaultModeWethAddress = wrappedNativeTokensList[BLOCKCHAIN_NAME.MODE]!.address;

export const defaultModeProviderConfiguration: UniswapV2ProviderConfiguration = {
    maxTransitTokens: 2,
    routingProvidersAddresses: defaultModeRoutingProvidersAddresses,
    wethAddress: defaultModeWethAddress
};
