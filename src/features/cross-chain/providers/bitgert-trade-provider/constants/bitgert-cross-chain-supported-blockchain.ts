import { BLOCKCHAIN_NAME } from '@rsdk-core/blockchain/models/blockchain-name';

export const bitgertCrossChainSupportedBlockchains = [
    BLOCKCHAIN_NAME.ETHEREUM,
    BLOCKCHAIN_NAME.BINANCE_SMART_CHAIN,
    BLOCKCHAIN_NAME.BITGERT
] as const;

export type BitgertCrossChainSupportedBlockchain =
    typeof bitgertCrossChainSupportedBlockchains[number];
