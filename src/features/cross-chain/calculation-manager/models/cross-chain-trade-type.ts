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
    STARGATE_V2: 'stargate_v2',
    ARBITRUM: 'arbitrum',
    SQUIDROUTER: 'squidrouter',
    SCROLL_BRIDGE: 'scroll_bridge',
    TAIKO_BRIDGE: 'taiko_bridge',
    RANGO: 'rango',
    PULSE_CHAIN_BRIDGE: 'pulsechain_bridge',
    ORBITER_BRIDGE: 'orbiter_bridge',
    OWL_TO_BRIDGE: 'owl_to_bridge',
    LAYERZERO: 'layerzero',
    ARCHON_BRIDGE: 'archon_bridge',
    MESON: 'meson',
    EDDY_BRIDGE: 'eddy_bridge',
    ROUTER: 'router',
    RETRO_BRIDGE: 'retro_bridge',
    ACROSS: 'across',
    UNIZEN: 'unizen',
    SIMPLE_SWAP: 'simple_swap'
} as const;

export type CrossChainTradeType =
    (typeof CROSS_CHAIN_TRADE_TYPE)[keyof typeof CROSS_CHAIN_TRADE_TYPE];
