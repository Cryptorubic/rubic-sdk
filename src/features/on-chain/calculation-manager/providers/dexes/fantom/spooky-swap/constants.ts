import { wrappedNativeTokensList } from 'src/common/tokens/constants/wrapped-native-tokens';
import { BLOCKCHAIN_NAME } from 'src/core/blockchain/models/blockchain-name';
import { UniswapV2ProviderConfiguration } from 'src/features/on-chain/calculation-manager/providers/dexes/common/uniswap-v2-abstract/models/uniswap-v2-provider-configuration';
import { defaultFantomProviderConfiguration } from 'src/features/on-chain/calculation-manager/providers/dexes/fantom/default-constants';

export const SPOOKY_SWAP_CONTRACT_ADDRESS = '0xF491e7B69E4244ad4002BC14e878a34207E38c29';

const routingProvidersAddresses = [
    wrappedNativeTokensList[BLOCKCHAIN_NAME.FANTOM]!.address, // wFTM
    '0x8d11ec38a3eb5e956b052f67da8bdc9bef8abf3e', // DAI
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
