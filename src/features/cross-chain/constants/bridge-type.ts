export const BRIDGE_TYPE = {
    ACROSS: 'across',
    ANY_SWAP: 'anyswap',
    ARBITRUM_BRIDGE: 'arbitrum',
    AVALANCHE_BRIDGE: 'avalanche',

    CELER_BRIDGE: 'cbridge',
    CONNEXT: 'connext',

    DE_BRIDGE: 'debridge',

    HOP: 'hop',
    HYPHEN: 'hyphen',

    MAKERS_WORMHOLE: 'maker',
    MULTICHAIN: 'multichain',

    OPTIMISM_GATEWAY: 'optimism',
    OSMOSIS_BRIDGE: 'osmosis',

    POLYGON: 'polygon',

    REFUEL: 'refuel',

    SATELLITE: 'satellite',
    STARGATE: 'stargate',
    SYMBIOSIS: 'symbiosis',
    SYNAPSE: 'synapse',

    THORCHAIN: 'thorchain',

    WORMHOLE: 'wormhole',

    YPOOL: 'ypool'
} as const;

export type BridgeType = typeof BRIDGE_TYPE[keyof typeof BRIDGE_TYPE];

export const bridges = Object.values(BRIDGE_TYPE);
