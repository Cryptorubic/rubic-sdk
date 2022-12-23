import { wrappedNativeTokensList } from 'src/common/tokens';
import { BLOCKCHAIN_NAME } from 'src/core/blockchain/models/blockchain-name';
import { defaultAvalancheProviderConfiguration } from 'src/features/on-chain/calculation-manager/providers/dexes/avalanche/default-constants';
import { UniswapV2ProviderConfiguration } from 'src/features/on-chain/calculation-manager/providers/dexes/common/uniswap-v2-abstract/models/uniswap-v2-provider-configuration';

export const JOE_CONTRACT_ADDRESS = '0x60aE616a2155Ee3d9A68541Ba4544862310933d4';

const routingProvidersAddresses = [
    wrappedNativeTokensList[BLOCKCHAIN_NAME.AVALANCHE].address, // WAVAX
    '0xc7198437980c041c805A1EDcbA50c1Ce5db95118', // USDT
    '0x6e84a6216eA6dACC71eE8E6b0a5B7322EEbC0fDd', // JOE
    '0x49D5c2BdFfac6CE2BFdB6640F4F80f226bc10bAB', // WETH
    '0xd1c3f94DE7e5B45fa4eDBBA472491a9f4B166FC4', // XAVA
    '0x8729438EB15e2C8B576fCc6AeCdA6A148776C0F5' // QI
];

export const JOE_PROVIDER_CONFIGURATION: UniswapV2ProviderConfiguration = {
    ...defaultAvalancheProviderConfiguration,
    routingProvidersAddresses
};
