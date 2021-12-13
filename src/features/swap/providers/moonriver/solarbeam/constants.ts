import { UniswapV2ProviderConfiguration } from '@features/swap/providers/common/uniswap-v2-abstract-provider/models/uniswap-v2-provider-configuration';
import { defaultMoonriverProviderConfiguration } from '@features/swap/providers/moonriver/default-constants';

const routingProvidersAddresses = [
    '0x98878B06940aE243284CA214f92Bb71a2b032B8A', // WMOVR
    '0xB44a9B6905aF7c801311e8F4E76932ee959c663C', // USDT
    '0xE3F5a90F9cb311505cd691a46596599aA1A0AD7D', // USDC
    '0x80A16016cC4A2E6a2CACA8a4a498b1699fF0f844', // DAI
    '0x5D9ab5522c64E1F6ef5e3627ECCc093f56167818', // BUSD
    '0x6bD193Ee6D2104F14F94E2cA6efefae561A4334B' // SOLAR
];

const wethAddress = '0xAA30eF758139ae4a7f798112902Bf6d65612045f';

export const SOLARBEAM_PROVIDER_CONFIGURATION: UniswapV2ProviderConfiguration = {
    ...defaultMoonriverProviderConfiguration,
    routingProvidersAddresses,
    wethAddress
};
