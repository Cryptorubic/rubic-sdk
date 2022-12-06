import { BLOCKCHAIN_NAME, BlockchainName } from 'src/core/blockchain/models/blockchain-name';

export const openOceanBlockchainName: Partial<Record<BlockchainName, string>> = {
    [BLOCKCHAIN_NAME.ETHEREUM]: 'eth',
    [BLOCKCHAIN_NAME.BINANCE_SMART_CHAIN]: 'bsc',
    [BLOCKCHAIN_NAME.POLYGON]: 'polygon',
    [BLOCKCHAIN_NAME.AVALANCHE]: 'avax',
    [BLOCKCHAIN_NAME.FANTOM]: 'fantom',
    [BLOCKCHAIN_NAME.ARBITRUM]: 'arbitrum',
    [BLOCKCHAIN_NAME.GNOSIS]: 'xdai',
    [BLOCKCHAIN_NAME.BOBA]: 'boba',
    [BLOCKCHAIN_NAME.OKE_X_CHAIN]: 'okex',
    [BLOCKCHAIN_NAME.HARMONY]: 'harmony'
};
