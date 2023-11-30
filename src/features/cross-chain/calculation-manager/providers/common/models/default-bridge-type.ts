import { CROSS_CHAIN_TRADE_TYPE } from 'src/features/cross-chain/calculation-manager/models/cross-chain-trade-type';

export const DEFAULT_BRIDGE_TYPE = {
    ...CROSS_CHAIN_TRADE_TYPE,

    '10K_SWAP': '10k_swap',

    ACROSS: 'across',
    AMAROK: 'connext',
    ANY_SWAP: 'anyswap',
    ARBITRUM_BRIDGE: 'arbitrum',
    AVALANCHE_BRIDGE: 'avalanche',

    CONNEXT: 'connext',
    CELERIM: 'celerim',

    HOP: 'hop',
    HYPHEN: 'hyphen',

    IBC: 'ibc',

    MAKERS_WORMHOLE: 'maker',
    MAYA_PROTOCOL: 'mayaprotocol',
    MULTICHAIN: 'multichain',

    OPEN_OCEAN: 'openocean',
    OPTIMISM_GATEWAY: 'optimism',
    ORBITER_BRIDGE: 'orbiter',
    OSMOSIS_BRIDGE: 'osmosis',

    POLYGON: 'polygon',

    RAINBOW: 'rainbow',
    REFUEL: 'refuel',

    SATELLITE: 'satellite',
    STARGATE: 'stargate',
    SYMBIOSIS: 'symbiosis',
    SYNAPSE: 'synapse',

    THORCHAIN: 'thorchain',
    THORCHAIN_STREAMING: 'thorchain_streaming',

    VOYAGER: 'voyager',

    WORMHOLE: 'wormhole',

    YPOOL: 'ypool'
} as const;

export type DefaultBridgeType = (typeof DEFAULT_BRIDGE_TYPE)[keyof typeof DEFAULT_BRIDGE_TYPE];
