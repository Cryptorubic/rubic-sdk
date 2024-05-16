import { BLOCKCHAIN_NAME } from "src/core/blockchain/models/blockchain-name";




export const eddyFinanceCrossChainSupportBlockChain = [
    BLOCKCHAIN_NAME.ZETACHAIN,
    BLOCKCHAIN_NAME.ETHEREUM,
    BLOCKCHAIN_NAME.BINANCE_SMART_CHAIN,
] as const;

export type EddyFinanceCrossChainSupportedBlockchain =
        (typeof eddyFinanceCrossChainSupportBlockChain )[number];