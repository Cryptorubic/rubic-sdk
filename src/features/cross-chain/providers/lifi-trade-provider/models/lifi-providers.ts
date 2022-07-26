export const Li_FI_TRADE_SUBTYPE = {
    CONNECT: 'connext',
    HOP: 'hop',
    CELER_BRIDGE: 'cbridge',
    MULTICHAIN: 'multichain',
    HYPHEN: 'hyphen',
    OPTIMISM_GATEWAY: 'optimism',
    POLYGON: 'polygon',
    AVALANCHE_BRIDGE: 'avalanche',
    ARBITRUM_BRIDGE: 'arbitrum',
    SYNAPSE: 'synapse',
    ACROSS: 'across',
    WORMHOLE: 'wormhole',
    MAKERS_WORMHOLE: 'maker',
    STARGATE: 'stargate'
} as const;

export type LiFiTradeSubtypeKeys = keyof typeof Li_FI_TRADE_SUBTYPE;
export type LiFiTradeSubtype = typeof Li_FI_TRADE_SUBTYPE[LiFiTradeSubtypeKeys];
