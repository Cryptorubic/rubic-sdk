import { BLOCKCHAIN_NAME } from '@rsdk-core/blockchain/models/blockchain-name';

export const symbiosisCrossChainSupportedBlockchains = [
    BLOCKCHAIN_NAME.ETHEREUM,
    BLOCKCHAIN_NAME.BINANCE_SMART_CHAIN,
    BLOCKCHAIN_NAME.POLYGON,
    BLOCKCHAIN_NAME.AVALANCHE,
    BLOCKCHAIN_NAME.BOBA,
    BLOCKCHAIN_NAME.TELOS,
    BLOCKCHAIN_NAME.BITCOIN
] as const;

export type SymbiosisCrossChainSupportedBlockchain =
    typeof symbiosisCrossChainSupportedBlockchains[number];
