import { BLOCKCHAIN_NAME } from 'src/core/blockchain/models/blockchain-name';

export const changenowCrossChainFromSupportedBlockchains = [
    BLOCKCHAIN_NAME.ETHEREUM,
    BLOCKCHAIN_NAME.BINANCE_SMART_CHAIN,
    BLOCKCHAIN_NAME.POLYGON
] as const;

export const changenowCrossChainToSupportedBlockchains = [BLOCKCHAIN_NAME.ICP] as const;

export type ChangenowCrossChainFromSupportedBlockchain =
    typeof changenowCrossChainFromSupportedBlockchains[number];
export type ChangenowCrossChainToSupportedBlockchain =
    typeof changenowCrossChainToSupportedBlockchains[number];

export type ChangenowCrossChainSupportedBlockchain =
    | ChangenowCrossChainFromSupportedBlockchain
    | ChangenowCrossChainToSupportedBlockchain;
