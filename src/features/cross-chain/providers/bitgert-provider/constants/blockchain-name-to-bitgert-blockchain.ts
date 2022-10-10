import { BLOCKCHAIN_NAME } from 'src/core/blockchain/models/blockchain-name';
import { BitgertCrossChainSupportedBlockchain } from './bitgert-cross-chain-supported-blockchain';

export const blockchainNameToBitgertBlockchain: Record<
    BitgertCrossChainSupportedBlockchain,
    string
> = {
    [BLOCKCHAIN_NAME.BINANCE_SMART_CHAIN]: 'BSC',
    [BLOCKCHAIN_NAME.ETHEREUM]: 'ETH',
    [BLOCKCHAIN_NAME.BITGERT]: 'BRISE'
};
