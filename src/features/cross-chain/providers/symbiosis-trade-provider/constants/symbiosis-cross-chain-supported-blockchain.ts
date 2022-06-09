import { BLOCKCHAIN_NAME } from '@core/blockchain/models/blockchain-name';

export const symbiosisCrossChainSupportedBlockchains = [
    BLOCKCHAIN_NAME.ETHEREUM,
    BLOCKCHAIN_NAME.BINANCE_SMART_CHAIN,
    BLOCKCHAIN_NAME.POLYGON,
    BLOCKCHAIN_NAME.AVALANCHE
] as const;

export type SymbiosisCrossChainSupportedBlockchain =
    typeof symbiosisCrossChainSupportedBlockchains[number];
