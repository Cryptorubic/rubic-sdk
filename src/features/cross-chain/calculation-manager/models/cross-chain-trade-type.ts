export const CROSS_CHAIN_TRADE_TYPE = {
    SYMBIOSIS: 'symbiosis',
    LIFI: 'lifi',
    DEBRIDGE: 'dln',
    VIA: 'via',
    RANGO: 'rango',
    BRIDGERS: 'bridgers',
    MULTICHAIN: 'multichain',
    XY: 'xy',
    CELER_BRIDGE: 'celer_bridge',
    CHANGENOW: 'changenow',
    STARGATE: 'stargate',
    ARBITRUM: 'arbitrum',
    SCROLL_BRIDGE: 'scroll_bridge'
} as const;

export type CrossChainTradeType =
    (typeof CROSS_CHAIN_TRADE_TYPE)[keyof typeof CROSS_CHAIN_TRADE_TYPE];
