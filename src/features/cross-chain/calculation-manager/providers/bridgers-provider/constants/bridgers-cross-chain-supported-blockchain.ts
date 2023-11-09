import { BLOCKCHAIN_NAME, EvmBlockchainName } from 'src/core/blockchain/models/blockchain-name';

export const bridgersCrossChainSupportedBlockchains = [
    BLOCKCHAIN_NAME.ETHEREUM,
    BLOCKCHAIN_NAME.BINANCE_SMART_CHAIN,
    BLOCKCHAIN_NAME.POLYGON,
    BLOCKCHAIN_NAME.FANTOM,
    BLOCKCHAIN_NAME.TRON,
    BLOCKCHAIN_NAME.GOERLI,
    BLOCKCHAIN_NAME.BINANCE_SMART_CHAIN_TESTNET,
    BLOCKCHAIN_NAME.MUMBAI
] as const;

export type BridgersCrossChainSupportedBlockchain =
    (typeof bridgersCrossChainSupportedBlockchains)[number];

export type BridgersEvmCrossChainSupportedBlockchain = BridgersCrossChainSupportedBlockchain &
    EvmBlockchainName;
