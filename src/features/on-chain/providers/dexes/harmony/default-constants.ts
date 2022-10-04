import { UniswapV2ProviderConfiguration } from 'src/features/on-chain/providers/dexes/abstract/uniswap-v2-abstract/models/uniswap-v2-provider-configuration';

const defaultHarmonyRoutingProvidersAddresses = [
    '0xcf664087a5bb0237a0bad6742852ec6c8d69a27a', // WONE
    '0xef977d2f931c1978db5f6747666fa1eacb0d0339', // DAI
    '0x985458e523db3d53125813ed68c274899e9dfab4', // USDC
    '0x3c2b8be99c50593081eaa2a724f0b8285f5aba8f', // USDT
    '0x3095c7557bcb296ccc6e363de01b760ba031f2d9', // WBTC
    '0x0dc78c79b4eb080ead5c1d16559225a46b580694', // WAGMI
    '0xea589e93ff18b1a1f1e9bac7ef3e86ab62addc79' // VIPER
];

const defaultHarmonyWethAddress = '0xcf664087a5bb0237a0bad6742852ec6c8d69a27a';

export const defaultHarmonyProviderConfiguration: UniswapV2ProviderConfiguration = {
    maxTransitTokens: 2,
    routingProvidersAddresses: defaultHarmonyRoutingProvidersAddresses,
    wethAddress: defaultHarmonyWethAddress
};
