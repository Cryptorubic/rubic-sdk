export const LIFI_BRIDGE_TYPES = {
    ACROSS: 'across',
    AMAROK: 'connext',
    ARBITRUM: 'arbitrum',
    AVALANCHE: 'avalanche',
    CBRIDGE: 'cbridge',
    CONNEXT: 'connext',
    HOP: 'hop',
    HYPHEN: 'hyphen',
    MULTICHAIN: 'multichain',
    STARGATE: 'stargate',
    // New
    ALLBRIDGE: 'allbridge',
    POLYGON_BRIDGE: 'polygon',
    OMNI_BRIDGE: 'omni',
    GNOSIS_BRIDGE: 'gnosis',
    CONNEXT_AMAROK: 'amarok',
    CIRCLE_CELER_BRIDGE: 'celercircle',
    LI_FUEL: 'lifuel',
    WORMHOLE: 'portal',
    CELERIM: 'celerim',
    THORSWAP: 'thorswap'
} as const;

export type LifiBridgeTypes = (typeof LIFI_BRIDGE_TYPES)[keyof typeof LIFI_BRIDGE_TYPES];
