import { CROSS_CHAIN_TRADE_TYPE } from 'src/features/cross-chain/calculation-manager/models/cross-chain-trade-type';

export const DEFAULT_BRIDGE_TYPE = {
    ...CROSS_CHAIN_TRADE_TYPE,

    ACROSS: 'across',
    AMAROK: 'connext',
    ANY_SWAP: 'anyswap',
    ARBITRUM_BRIDGE: 'arbitrum',
    AVALANCHE_BRIDGE: 'avalanche',

    CONNEXT: 'connext',
    CELERIM: 'celerim',

    HOP: 'hop',
    HYPHEN: 'hyphen',
    OPEN_OCEAN: 'openocean',

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

export type DefaultBridgeType = (typeof DEFAULT_BRIDGE_TYPE)[keyof typeof DEFAULT_BRIDGE_TYPE];
