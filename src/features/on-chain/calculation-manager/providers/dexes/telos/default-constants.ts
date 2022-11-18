import { UniswapV2ProviderConfiguration } from 'src/features/on-chain/calculation-manager/providers/dexes/abstract/uniswap-v2-abstract/models/uniswap-v2-provider-configuration';
import { BLOCKCHAIN_NAME } from 'src/core/blockchain/models/blockchain-name';
import { wrappedNativeTokensList } from 'src/common/tokens';

const defaultTelosRoutingProvidersAddresses = [
    wrappedNativeTokensList[BLOCKCHAIN_NAME.TELOS].address, // WTLOS
    '0xeFAeeE334F0Fd1712f9a8cc375f427D9Cdd40d73', // USDT
    '0x818ec0A7Fe18Ff94269904fCED6AE3DaE6d6dC0b', // USDC
    '0xf390830DF829cf22c53c8840554B98eafC5dCBc2', // BTC
    '0xfA9343C3897324496A05fC75abeD6bAC29f8A40f' // ETH
];

const defaultTelosWethAddress = wrappedNativeTokensList[BLOCKCHAIN_NAME.TELOS].address;

export const defaultTelosProviderConfiguration: UniswapV2ProviderConfiguration = {
    maxTransitTokens: 1,
    routingProvidersAddresses: defaultTelosRoutingProvidersAddresses,
    wethAddress: defaultTelosWethAddress
};
