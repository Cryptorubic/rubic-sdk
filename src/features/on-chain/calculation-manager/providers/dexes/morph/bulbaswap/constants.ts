import { wrappedAddress } from 'src/common/tokens/constants/wrapped-addresses';
import { BLOCKCHAIN_NAME } from 'src/core/blockchain/models/blockchain-name';
import { UniswapV2ProviderConfiguration } from 'src/features/on-chain/calculation-manager/providers/dexes/common/uniswap-v2-abstract/models/uniswap-v2-provider-configuration';
import { defaultMoonriverProviderConfiguration } from 'src/features/on-chain/calculation-manager/providers/dexes/moonriver/default-constants';

export const BULBASWAP_CONTRACT_ADDRESS = '0x81606E6f8aAD6C75c2f383Ea595c2b9f8ce8aE3a';

const routingProvidersAddresses = [
    wrappedAddress[BLOCKCHAIN_NAME.MORPH]!, // WETH
    '0xc7D67A9cBB121b3b0b9c053DD9f469523243379A', // USDT
    '0xe34c91815d7fc18A9e2148bcD4241d0a5848b693', // USDC
    '0xef8A24599229D002B28bA2F5C0eBdD3c0EFFbed4', // DAI
    '0x803DcE4D3f4Ae2e17AF6C51343040dEe320C149D' // WBTC
];

export const BULBASWAP_PROVIDER_CONFIGURATION: UniswapV2ProviderConfiguration = {
    ...defaultMoonriverProviderConfiguration,
    routingProvidersAddresses,
    wethAddress: wrappedAddress[BLOCKCHAIN_NAME.MORPH]!
};
