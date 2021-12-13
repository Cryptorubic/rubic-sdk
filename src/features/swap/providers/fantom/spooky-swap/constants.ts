import { UniswapV2ProviderConfiguration } from '@features/swap/providers/common/uniswap-v2-abstract-provider/models/uniswap-v2-provider-configuration';
import { defaultFantomProviderConfiguration } from '@features/swap/providers/fantom/default-constants';

const routingProvidersAddresses = [
    '0x21be370D5312f44cB42ce377BC9b8a0cEF1A4C83', // wFTM
    '0x5cc61a78f164885776aa610fb0fe1257df78e59b', // SPIRIT
    '0x04068da6c83afcfa0e13ba15a6696662335d5b75', // USDC
    '0x049d68029688eAbF473097a2fC38ef61633A3C7A', // fUSDT
    '0x321162Cd933E2Be498Cd2267a90534A804051b11', // wBTC
    '0x74b23882a30290451a17c44f4f05243b6b58c76d', // wETH
    '0x841fad6eae12c286d1fd18d1d525dffa75c7effe' // BOO
];

export const SPOOKY_SWAP_PROVIDER_CONFIGURATION: UniswapV2ProviderConfiguration = {
    ...defaultFantomProviderConfiguration,
    routingProvidersAddresses
};
