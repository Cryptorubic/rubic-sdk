import { BLOCKCHAIN_NAME } from 'src/core/blockchain/models/blockchain-name';

export const multichainProxyCrossChainSupportedBlockchains = [
    BLOCKCHAIN_NAME.BINANCE_SMART_CHAIN,
    BLOCKCHAIN_NAME.POLYGON,
    BLOCKCHAIN_NAME.KAVA, // Not verified
    // BLOCKCHAIN_NAME.BITGEART, Not verified
    BLOCKCHAIN_NAME.CRONOS,
    BLOCKCHAIN_NAME.ARBITRUM,
    BLOCKCHAIN_NAME.FANTOM,
    BLOCKCHAIN_NAME.MOONRIVER,
    BLOCKCHAIN_NAME.TELOS,
    BLOCKCHAIN_NAME.MOONBEAM,
    BLOCKCHAIN_NAME.FUSE,
    BLOCKCHAIN_NAME.CELO,
    // BLOCKCHAIN_NAME.OKE_X_CHAIN, Not verified
    BLOCKCHAIN_NAME.BOBA,
    BLOCKCHAIN_NAME.GNOSIS,
    // BLOCKCHAIN_NAME.OPTIMISM, Not verified
    BLOCKCHAIN_NAME.AVALANCHE,
    BLOCKCHAIN_NAME.ETHEREUM
] as const;

export type MultichainProxyCrossChainSupportedBlockchain =
    typeof multichainProxyCrossChainSupportedBlockchains[number];
