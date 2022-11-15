import { BLOCKCHAIN_NAME } from 'src/core/blockchain/models/blockchain-name';
import { ChaingeCrossChainSupportedBlockchain } from './chainge-cross-chain-supported-blockchain';

export const chaingeBlockchainName: Record<ChaingeCrossChainSupportedBlockchain, string> = {
    [BLOCKCHAIN_NAME.ETHEREUM]: 'ETH',
    [BLOCKCHAIN_NAME.BINANCE_SMART_CHAIN]: 'BSC',
    [BLOCKCHAIN_NAME.POLYGON]: 'MATIC',
    [BLOCKCHAIN_NAME.AVALANCHE]: 'AVAX',
    [BLOCKCHAIN_NAME.FANTOM]: 'FTM',
    [BLOCKCHAIN_NAME.ARBITRUM]: 'ARB',
    [BLOCKCHAIN_NAME.AURORA]: 'AURORA',
    [BLOCKCHAIN_NAME.OKE_X_CHAIN]: 'OKT'
};
