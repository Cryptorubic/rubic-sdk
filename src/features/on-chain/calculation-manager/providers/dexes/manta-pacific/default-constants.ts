import { wrappedNativeTokensList } from 'src/common/tokens';
import { BLOCKCHAIN_NAME } from 'src/core/blockchain/models/blockchain-name';
import { UniswapV2ProviderConfiguration } from 'src/features/on-chain/calculation-manager/providers/dexes/common/uniswap-v2-abstract/models/uniswap-v2-provider-configuration';

const defaultMantaPacificRoutingProvidersAddresses = [
    wrappedNativeTokensList[BLOCKCHAIN_NAME.MANTA_PACIFIC]!.address, // WETH
    '0xf417F5A458eC102B90352F697D6e2Ac3A3d2851f', // USDT
    '0xb73603C5d87fA094B7314C74ACE2e64D165016fb', // USDC
    '0x1c466b9371f8aBA0D7c458bE10a62192Fcb8Aa71', // DAI
    '0x305E88d809c9DC03179554BFbf85Ac05Ce8F18d6' // WBTC
];

const defaultMantaPacificWethAddress =
    wrappedNativeTokensList[BLOCKCHAIN_NAME.MANTA_PACIFIC]!.address;

export const defaultMantaPacificProviderConfiguration: UniswapV2ProviderConfiguration = {
    maxTransitTokens: 2,
    routingProvidersAddresses: defaultMantaPacificRoutingProvidersAddresses,
    wethAddress: defaultMantaPacificWethAddress
};
