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
