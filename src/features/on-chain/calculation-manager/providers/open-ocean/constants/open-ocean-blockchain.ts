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
    [BLOCKCHAIN_NAME.HARMONY]: 'harmony'
};
