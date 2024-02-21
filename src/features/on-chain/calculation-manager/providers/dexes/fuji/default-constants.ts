import { wrappedNativeTokensList } from 'src/common/tokens/constants/wrapped-native-tokens';
import { BLOCKCHAIN_NAME } from 'src/core/blockchain/models/blockchain-name';
import { UniswapV2ProviderConfiguration } from 'src/features/on-chain/calculation-manager/providers/dexes/common/uniswap-v2-abstract/models/uniswap-v2-provider-configuration';

const wethAddress = wrappedNativeTokensList[BLOCKCHAIN_NAME.AVALANCHE]!.address;

const routingProvidersAddresses = [
    wrappedNativeTokensList[BLOCKCHAIN_NAME.AVALANCHE]!.address, // WAVAX
    '0x231401dc8b53338d78c08f83cc4ebc74148196d0', // USDC
    '0x5425890298aed601595a70ab815c96711a31bc65', // USDC2
    '0x0b9d5d9136855f6fec3c0993fee6e9ce8a297846', // LINK
    '0x49D5c2BdFfac6CE2BFdB6640F4F80f226bc10bAB', // WETH
    '0xd1c3f94DE7e5B45fa4eDBBA472491a9f4B166FC4' // XAVA
];

export const defaultFujiProviderConfiguration: UniswapV2ProviderConfiguration = {
    maxTransitTokens: 3,
    routingProvidersAddresses,
    wethAddress
};
