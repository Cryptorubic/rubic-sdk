export const EVM_BLOCKCHAIN_NAME = {
    ETHEREUM: 'ETH',
    BINANCE_SMART_CHAIN: 'BSC',
    POLYGON: 'POLYGON',
    AVALANCHE: 'AVALANCHE',
    MOONRIVER: 'MOONRIVER',
    FANTOM: 'FANTOM',
    HARMONY: 'HARMONY',
    ARBITRUM: 'ARBITRUM',
    AURORA: 'AURORA',
    TELOS: 'TELOS',
    OPTIMISM: 'OPTIMISM',
    CRONOS: 'CRONOS',
    OKE_X_CHAIN: 'OKX',
    GNOSIS: 'GNOSIS',
    FUSE: 'FUSE',
    MOONBEAM: 'MOONBEAM',
    CELO: 'CELO',
    BOBA: 'BOBA',
    ASTAR: 'ASTAR',
    ETHEREUM_POW: 'ETHW',
    KAVA: 'KAVA',
    BITGERT: 'BITGERT',
    OASIS: 'OASIS',
    METIS: 'METIS',
    DFK: 'DEFIKINGDOMS'
} as const;

export const BLOCKCHAIN_NAME = {
    ...EVM_BLOCKCHAIN_NAME,
    SOLANA: 'SOLANA',
    NEAR: 'NEAR',
    BITCOIN: 'BITCOIN',
    TRON: 'TRON'
} as const;

export type BlockchainName = typeof BLOCKCHAIN_NAME[keyof typeof BLOCKCHAIN_NAME];

export type EvmBlockchainName = typeof EVM_BLOCKCHAIN_NAME[keyof typeof EVM_BLOCKCHAIN_NAME];
export type SolanaBlockchainName = typeof BLOCKCHAIN_NAME.SOLANA;
export type NearBlockchainName = typeof BLOCKCHAIN_NAME.NEAR;
export type BitcoinBlockchainName = typeof BLOCKCHAIN_NAME.BITCOIN;
export type TronBlockchainName = typeof BLOCKCHAIN_NAME.TRON;
