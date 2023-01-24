import { BLOCKCHAIN_NAME } from 'src/core/blockchain/models/blockchain-name';

export const openoceanOnChainSupportedBlockchains = [
    BLOCKCHAIN_NAME.ETHEREUM,
    BLOCKCHAIN_NAME.BINANCE_SMART_CHAIN,
    BLOCKCHAIN_NAME.POLYGON,
    BLOCKCHAIN_NAME.AVALANCHE,
    BLOCKCHAIN_NAME.FANTOM,
    BLOCKCHAIN_NAME.ARBITRUM,
    BLOCKCHAIN_NAME.OKE_X_CHAIN,
    BLOCKCHAIN_NAME.HARMONY,
    BLOCKCHAIN_NAME.BOBA,
    BLOCKCHAIN_NAME.GNOSIS
] as const;

export type OpenoceanOnChainSupportedBlockchain =
    (typeof openoceanOnChainSupportedBlockchains)[number];
