import { BLOCKCHAIN_NAME } from 'src/core/blockchain/models/blockchain-name';

export const multichainProxyCrossChainSupportedBlockchains = [
    BLOCKCHAIN_NAME.POLYGON,
    BLOCKCHAIN_NAME.KAVA
] as const;

export type MultichainProxyCrossChainSupportedBlockchain =
    typeof multichainProxyCrossChainSupportedBlockchains[number];
