import { BLOCKCHAIN_NAME } from 'src/core/blockchain/models/blockchain-name';

export const archonBridgeSupportedBlockchains = [
    BLOCKCHAIN_NAME.ETHEREUM,
    BLOCKCHAIN_NAME.AVALANCHE,
    BLOCKCHAIN_NAME.HORIZEN_EON
] as const;

export type ArchonBridgeSupportedBlockchain = (typeof archonBridgeSupportedBlockchains)[number];
export type ArchonBridgeNonEonSupportedBlockchain = Exclude<
    ArchonBridgeSupportedBlockchain,
    typeof BLOCKCHAIN_NAME.HORIZEN_EON
>;
