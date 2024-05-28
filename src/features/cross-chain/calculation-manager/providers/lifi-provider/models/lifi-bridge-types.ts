export const LIFI_API_CROSS_CHAIN_PROVIDERS = {
    ACROSS: 'across',
    ARBITRUM: 'arbitrum',
    CBRIDGE: 'cbridge',
    HOP: 'hop',
    HYPHEN: 'hyphen',
    STARGATE: 'stargate',
    ALLBRIDGE: 'allbridge',
    OMNI_BRIDGE: 'omni',
    GNOSIS_BRIDGE: 'gnosis',
    CONNEXT_AMAROK: 'amarok',
    CIRCLE_CELER_BRIDGE: 'celercircle',
    CELERIM: 'celerim',
    OPTIMISM: 'optimism',
    SYMBIOSIS: 'symbiosis'
} as const;

export type LifiSubProvider =
    (typeof LIFI_API_CROSS_CHAIN_PROVIDERS)[keyof typeof LIFI_API_CROSS_CHAIN_PROVIDERS];

export const bridgeTool = {
    CONNEXT: 'connext',
    HOP: 'hop',
    MULTICHAIN: 'multichain',
    CBRIDGE: 'cbridge',
    HYPHEN: 'hyphen',
    POLYGON: 'polygon',
    ARBITRUM: 'arbitrum',
    AVALANCE: 'avalanche',
    OPTIMISM: 'optimism',
    ACROSS: 'across',
    PORTAL: 'portal',
    STARGATE: 'stargate'
} as const;

export type BridgeTool = (typeof bridgeTool)[keyof typeof bridgeTool];

export interface Bridge {
    key: BridgeTool;
    name: string;
    logoURI: string;
    bridgeUrl?: string;
    discordUrl?: string;
    supportUrl?: string;
    docsUrl?: string;
    explorerUrl?: string;
    analyticsUrl?: string;
}
