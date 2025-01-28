import {
    BLOCKCHAIN_NAME,
    EvmBlockchainName,
    SolanaBlockchainName
} from 'src/core/blockchain/models/blockchain-name';

export const dlnOnChainSupportedBlockchains = [
    // BLOCKCHAIN_NAME.ETHEREUM,
    // BLOCKCHAIN_NAME.BINANCE_SMART_CHAIN,
    // BLOCKCHAIN_NAME.POLYGON,
    // BLOCKCHAIN_NAME.ARBITRUM,
    // BLOCKCHAIN_NAME.AVALANCHE,
    // BLOCKCHAIN_NAME.LINEA,
    // BLOCKCHAIN_NAME.OPTIMISM,
    // BLOCKCHAIN_NAME.BASE,
    BLOCKCHAIN_NAME.SOLANA
] as const;

export type DlnOnChainSupportedBlockchain = (typeof dlnOnChainSupportedBlockchains)[number];
export type DlnEvmOnChainSupportedBlockchain = (typeof dlnOnChainSupportedBlockchains)[number] &
    EvmBlockchainName;
export type DlnSolanaOnChainSupportedBlockchain = (typeof dlnOnChainSupportedBlockchains)[number] &
    SolanaBlockchainName;
