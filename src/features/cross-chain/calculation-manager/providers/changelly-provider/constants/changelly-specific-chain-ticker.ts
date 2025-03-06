import { BLOCKCHAIN_NAME, BlockchainName } from 'src/core/blockchain/models/blockchain-name';

export const changellySpecificChainTickers: Partial<Record<BlockchainName, string>> = {
    [BLOCKCHAIN_NAME.ETHEREUM]: 'ethereum',
    [BLOCKCHAIN_NAME.BINANCE_SMART_CHAIN]: 'binance_smart_chain',
    [BLOCKCHAIN_NAME.AVALANCHE]: 'avaxc',
    [BLOCKCHAIN_NAME.ZK_SYNC]: 'zksync',
    [BLOCKCHAIN_NAME.ZK_LINK]: 'zklink',
    [BLOCKCHAIN_NAME.MANTA_PACIFIC]: 'manta',
    [BLOCKCHAIN_NAME.APTOS]: 'apt'
};
