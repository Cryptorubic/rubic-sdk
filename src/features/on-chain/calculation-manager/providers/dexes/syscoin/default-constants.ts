import { UniswapV2ProviderConfiguration } from 'src/features/on-chain/calculation-manager/providers/dexes/common/uniswap-v2-abstract/models/uniswap-v2-provider-configuration';
import { BLOCKCHAIN_NAME } from 'src/core/blockchain/models/blockchain-name';
import { wrappedNativeTokensList } from 'src/common/tokens';

const defaultSyscoinRoutingProvidersAddresses = [
    wrappedNativeTokensList[BLOCKCHAIN_NAME.SYSCOIN].address, // WSYS
    '0x2bF9b864cdc97b08B6D79ad4663e71B8aB65c45c', // USDC
    '0x922D641a426DcFFaeF11680e5358F34d97d112E1' // USDT
];

const defaultSyscoinWethAddress = wrappedNativeTokensList[BLOCKCHAIN_NAME.SYSCOIN].address;

export const defaultSyscoinProviderConfiguration: UniswapV2ProviderConfiguration = {
    maxTransitTokens: 2,
    routingProvidersAddresses: defaultSyscoinRoutingProvidersAddresses,
    wethAddress: defaultSyscoinWethAddress
};
