export const CROSS_CHAIN_TRADE_TYPE = {
    SYMBIOSIS: 'symbiosis',
    LIFI: 'lifi',
    DEBRIDGE: 'dln',
    BRIDGERS: 'bridgers',
    MULTICHAIN: 'multichain',
    XY: 'xy',
    CELER_BRIDGE: 'celer_bridge',
    CHANGENOW: 'changenow',
    STARGATE: 'stargate',
    ARBITRUM: 'arbitrum',
    SQUIDROUTER: 'squidrouter',
    SCROLL_BRIDGE: 'scroll_bridge',
    TAIKO_BRIDGE: 'taiko_bridge',
    RANGO: 'rango',
    PULSE_CHAIN_BRIDGE: 'pulsechain_bridge',
    ORBITER_BRIDGE: 'orbiter_bridge',
    LAYERZERO: 'layerzero',
    ARCHON_BRIDGE: 'archon_bridge',
    MESON: 'meson'
} as const;

export type CrossChainTradeType =
    (typeof CROSS_CHAIN_TRADE_TYPE)[keyof typeof CROSS_CHAIN_TRADE_TYPE];
