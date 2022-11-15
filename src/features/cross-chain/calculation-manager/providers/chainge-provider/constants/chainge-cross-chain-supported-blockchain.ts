import { BLOCKCHAIN_NAME } from 'src/core/blockchain/models/blockchain-name';

export const chaingeCrossChainSupportedBlockchains = [
    BLOCKCHAIN_NAME.ETHEREUM,
    BLOCKCHAIN_NAME.BINANCE_SMART_CHAIN,
    BLOCKCHAIN_NAME.POLYGON,
    BLOCKCHAIN_NAME.AVALANCHE,
    BLOCKCHAIN_NAME.FANTOM,
    BLOCKCHAIN_NAME.ARBITRUM,
    BLOCKCHAIN_NAME.AURORA,
    BLOCKCHAIN_NAME.OKE_X_CHAIN
] as const;

export type ChaingeCrossChainSupportedBlockchain =
    typeof chaingeCrossChainSupportedBlockchains[number];
