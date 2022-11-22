import { BLOCKCHAIN_NAME } from 'src/core/blockchain/models/blockchain-name';

export const connextSupportedBlockchains = [
    BLOCKCHAIN_NAME.ETHEREUM,
    BLOCKCHAIN_NAME.BINANCE_SMART_CHAIN,
    BLOCKCHAIN_NAME.GNOSIS,
    BLOCKCHAIN_NAME.POLYGON,
    BLOCKCHAIN_NAME.MOONBEAM,
    BLOCKCHAIN_NAME.ARBITRUM,
    BLOCKCHAIN_NAME.OPTIMISM
] as const;

export type ConnextCrossChainSupportedBlockchain = typeof connextSupportedBlockchains[number];
