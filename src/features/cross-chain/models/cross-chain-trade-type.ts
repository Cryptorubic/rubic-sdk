export const CROSS_CHAIN_TRADE_TYPE = {
    CELER: 'CELER',
    SYMBIOSIS: 'SYMBIOSIS',
    LIFI: 'LIFI',
    DEBRIDGE: 'DEBRIDGE',
    VIA: 'VIA',
    RANGO: 'RANGO'
} as const;

export type CrossChainTradeType = keyof typeof CROSS_CHAIN_TRADE_TYPE;
