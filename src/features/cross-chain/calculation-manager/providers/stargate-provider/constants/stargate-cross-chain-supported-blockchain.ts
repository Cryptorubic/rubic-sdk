import { BLOCKCHAIN_NAME } from 'src/core/blockchain/models/blockchain-name';

export const stargateCrossChainSupportedBlockchains = [
    BLOCKCHAIN_NAME.ETHEREUM,
    BLOCKCHAIN_NAME.BINANCE_SMART_CHAIN,
    BLOCKCHAIN_NAME.POLYGON,
    BLOCKCHAIN_NAME.AVALANCHE,
    BLOCKCHAIN_NAME.FANTOM,
    BLOCKCHAIN_NAME.ARBITRUM,
    BLOCKCHAIN_NAME.OPTIMISM
] as const;

export type StargateCrossChainSupportedBlockchain =
    typeof stargateCrossChainSupportedBlockchains[number];
