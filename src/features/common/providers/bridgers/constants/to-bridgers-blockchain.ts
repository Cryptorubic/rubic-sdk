import { BLOCKCHAIN_NAME } from 'src/core/blockchain/models/blockchain-name';
import { BridgersCrossChainSupportedBlockchain } from 'src/features/cross-chain/calculation-manager/providers/bridgers-provider/constants/bridgers-cross-chain-supported-blockchain';

export const toBridgersBlockchain: Record<BridgersCrossChainSupportedBlockchain, string> = {
    [BLOCKCHAIN_NAME.ETHEREUM]: 'ETH',
    [BLOCKCHAIN_NAME.BINANCE_SMART_CHAIN]: 'BSC',
    [BLOCKCHAIN_NAME.POLYGON]: 'POLYGON',
    [BLOCKCHAIN_NAME.FANTOM]: 'FANTOM',
    [BLOCKCHAIN_NAME.TRON]: 'TRON',
    [BLOCKCHAIN_NAME.GOERLI]: 'GOERLI',
    [BLOCKCHAIN_NAME.BINANCE_SMART_CHAIN_TESTNET]: 'BSCT',
    [BLOCKCHAIN_NAME.MUMBAI]: 'MUMBAI'
};
