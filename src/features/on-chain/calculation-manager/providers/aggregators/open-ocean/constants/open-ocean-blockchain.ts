import { BLOCKCHAIN_NAME } from 'src/core/blockchain/models/blockchain-name';

import { OpenoceanOnChainSupportedBlockchain } from './open-ocean-on-chain-supported-blockchain';

export const openOceanBlockchainName: Record<OpenoceanOnChainSupportedBlockchain, string> = {
    [BLOCKCHAIN_NAME.ETHEREUM]: 'eth',
    [BLOCKCHAIN_NAME.BINANCE_SMART_CHAIN]: 'bsc',
    [BLOCKCHAIN_NAME.POLYGON]: 'polygon',
    [BLOCKCHAIN_NAME.AVALANCHE]: 'avax',
    [BLOCKCHAIN_NAME.FANTOM]: 'fantom',
    [BLOCKCHAIN_NAME.ARBITRUM]: 'arbitrum',
    [BLOCKCHAIN_NAME.GNOSIS]: 'xdai',
    [BLOCKCHAIN_NAME.BOBA]: 'boba',
    [BLOCKCHAIN_NAME.OKE_X_CHAIN]: 'okex',
    [BLOCKCHAIN_NAME.HARMONY]: 'harmony',
    [BLOCKCHAIN_NAME.OPTIMISM]: 'optimism',
    [BLOCKCHAIN_NAME.LINEA]: 'linea',
    [BLOCKCHAIN_NAME.POLYGON_ZKEVM]: 'polygon_zkevm',
    [BLOCKCHAIN_NAME.ZK_SYNC]: 'zksync',
    [BLOCKCHAIN_NAME.BASE]: 'base',
    [BLOCKCHAIN_NAME.MANTA_PACIFIC]: 'manta',
    [BLOCKCHAIN_NAME.METIS]: 'metis',
    [BLOCKCHAIN_NAME.SCROLL]: 'scroll',
    [BLOCKCHAIN_NAME.BLAST]: 'blast',
    [BLOCKCHAIN_NAME.MODE]: 'mode',
    [BLOCKCHAIN_NAME.ROOTSTOCK]: 'rootstock',
    [BLOCKCHAIN_NAME.MANTLE]: 'mantle',
    [BLOCKCHAIN_NAME.SONIC]: 'sonic',
    [BLOCKCHAIN_NAME.SUI]: 'sui'
};
