import { BLOCKCHAIN_NAME } from 'src/core/blockchain/models/blockchain-name';

export const OKUSWAP_BLOCKCHAINS = {
    [BLOCKCHAIN_NAME.ROOTSTOCK]: 'rootstock',
    [BLOCKCHAIN_NAME.ETHEREUM]: 'ethereum',
    [BLOCKCHAIN_NAME.ZK_SYNC]: 'zksync',
    [BLOCKCHAIN_NAME.BASE]: 'base',
    [BLOCKCHAIN_NAME.POLYGON]: 'polygon',
    [BLOCKCHAIN_NAME.OPTIMISM]: 'optimism',
    [BLOCKCHAIN_NAME.ARBITRUM]: 'arbitrum',
    [BLOCKCHAIN_NAME.BINANCE_SMART_CHAIN]: 'bsc',
    [BLOCKCHAIN_NAME.SCROLL]: 'scroll',
    [BLOCKCHAIN_NAME.MANTA_PACIFIC]: 'manta',
    [BLOCKCHAIN_NAME.BOBA]: 'boba',
    [BLOCKCHAIN_NAME.BLAST]: 'blast',
    [BLOCKCHAIN_NAME.POLYGON_ZKEVM]: 'polygon-zkevm',
    [BLOCKCHAIN_NAME.MOONBEAM]: 'moonbeam'
} as const;

export type OkuSwapBlockchainName = (typeof OKUSWAP_BLOCKCHAINS)[keyof typeof OKUSWAP_BLOCKCHAINS];
