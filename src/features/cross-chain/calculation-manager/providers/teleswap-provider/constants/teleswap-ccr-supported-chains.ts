import { BLOCKCHAIN_NAME } from 'src/core/blockchain/models/blockchain-name';

export const teleSwapCcrSupportedChains = [
    BLOCKCHAIN_NAME.ETHEREUM,
    BLOCKCHAIN_NAME.POLYGON,
    BLOCKCHAIN_NAME.OPTIMISM,
    BLOCKCHAIN_NAME.BINANCE_SMART_CHAIN,
    BLOCKCHAIN_NAME.ARBITRUM,
    BLOCKCHAIN_NAME.BASE,
    BLOCKCHAIN_NAME.BITCOIN
];

export type TeleSwapCcrSupportedChain = (typeof teleSwapCcrSupportedChains)[number];

export const teleSwapBaseChains = [BLOCKCHAIN_NAME.POLYGON, BLOCKCHAIN_NAME.BINANCE_SMART_CHAIN];

export type TeleSwapCcrBaseChain = (typeof teleSwapBaseChains)[number];
