export const RANGO_TRADE_SUBTYPE = {
    ANYSWAP_AGGREGATOR: 'AnySwap Aggregator',
    ANYSWAP_BRIDGE: 'AnySwap',
    ACROSS: 'Across',
    CBRIDGE_AGGREGATOR: 'CBridge Aggregator',
    CELER_BRIDGE: 'cBridge v2.0',
    ARBITRUM_BRIDGE: 'Arbitrum Bridge',
    AVALANCHE_BRIDGE: 'Avalanche Bridge',
    OPENOCEAN: 'OpenOcean',
    HOP: 'Hop',
    HYPHEN: 'Hyphen',
    OPTIMISM_BRIDGE: 'Optimism Bridge',
    STARGATE: 'stargate'
} as const;

export type RangoTradeSubtypeKeys = keyof typeof RANGO_TRADE_SUBTYPE;
export type RangoTradeSubtype = typeof RANGO_TRADE_SUBTYPE[RangoTradeSubtypeKeys];
