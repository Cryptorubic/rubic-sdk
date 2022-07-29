export const CROSS_CHAIN_TRADE_TYPE = {
    RUBIC: 'RUBIC',
    CELER: 'CELER',
    SYMBIOSIS: 'SYMBIOSIS',
    LIFI: 'LIFI',
    DEBRIDGE: 'DEBRIDGE'
} as const;

export type CrossChainTradeType = keyof typeof CROSS_CHAIN_TRADE_TYPE;
