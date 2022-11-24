import { UniswapV2ProviderConfiguration } from 'src/features/on-chain/calculation-manager/providers/dexes/common/uniswap-v2-abstract/models/uniswap-v2-provider-configuration';
import { BLOCKCHAIN_NAME } from 'src/core/blockchain/models/blockchain-name';
import { wrappedNativeTokensList } from 'src/common/tokens';

const defaultFantomRoutingProvidersAddresses = [
    wrappedNativeTokensList[BLOCKCHAIN_NAME.FANTOM].address, // wFTM
    '0x5cc61a78f164885776aa610fb0fe1257df78e59b', // SPIRIT
    '0x04068da6c83afcfa0e13ba15a6696662335d5b75', // USDC
    '0x049d68029688eAbF473097a2fC38ef61633A3C7A', // fUSDT
    '0x82f0b8b456c1a451378467398982d4834b6829c1', // MIM
    '0x321162Cd933E2Be498Cd2267a90534A804051b11', // wBTC
    '0x74b23882a30290451a17c44f4f05243b6b58c76d' // wETH
];

const defaultFantomWethAddress = wrappedNativeTokensList[BLOCKCHAIN_NAME.FANTOM].address;

export const defaultFantomProviderConfiguration: UniswapV2ProviderConfiguration = {
    maxTransitTokens: 2,
    routingProvidersAddresses: defaultFantomRoutingProvidersAddresses,
    wethAddress: defaultFantomWethAddress
};
