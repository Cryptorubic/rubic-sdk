export const CROSS_CHAIN_TRADE_TYPE = {
    CELER: 'cbridge',
    SYMBIOSIS: 'symbiosis',
    LIFI: 'lifi',
    DEBRIDGE: 'debridge',
    VIA: 'via',
    RANGO: 'rango',
    BRIDGERS: 'bridgers',
    MULTICHAIN: 'multichain'
} as const;

export type CrossChainTradeType =
    typeof CROSS_CHAIN_TRADE_TYPE[keyof typeof CROSS_CHAIN_TRADE_TYPE];
