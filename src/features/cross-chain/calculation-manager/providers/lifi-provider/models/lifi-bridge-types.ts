export const LIFI_BRIDGE_TYPES = {
    ACROSS: 'across',
    ARBITRUM: 'arbitrum',
    AVALANCHE: 'avalanche',
    CBRIDGE: 'cBridge',
    CONNEXT: 'connext',
    HOP: 'hop',
    HYPHEN: 'hyphen',
    MULTICHAIN: 'multichain',
    STARGATE: 'stargate'
} as const;

export type LifiBridgeTypes = (typeof LIFI_BRIDGE_TYPES)[keyof typeof LIFI_BRIDGE_TYPES];
