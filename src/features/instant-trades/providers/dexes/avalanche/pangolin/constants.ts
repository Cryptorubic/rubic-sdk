import { defaultAvalancheProviderConfiguration } from 'src/features/instant-trades/providers/dexes/avalanche/default-constants';
import { UniswapV2ProviderConfiguration } from 'src/features/instant-trades/providers/dexes/abstract/uniswap-v2-abstract/models/uniswap-v2-provider-configuration';

export const PANGOLIN_CONTRACT_ADDRESS = '0xE54Ca86531e17Ef3616d22Ca28b0D458b6C89106';

const routingProvidersAddresses = [
    '0xB31f66AA3C1e785363F0875A1B74E27b85FD66c7', // WAVAX
    '0xc7198437980c041c805A1EDcbA50c1Ce5db95118', // USDT
    '0x60781C2586D68229fde47564546784ab3fACA982', // PNG
    '0x49D5c2BdFfac6CE2BFdB6640F4F80f226bc10bAB', // WETH
    '0xd1c3f94DE7e5B45fa4eDBBA472491a9f4B166FC4', // XAVA
    '0x8729438EB15e2C8B576fCc6AeCdA6A148776C0F5' // QI
];

export const PANGOLIN_PROVIDER_CONFIGURATION: UniswapV2ProviderConfiguration = {
    ...defaultAvalancheProviderConfiguration,
    routingProvidersAddresses
};
