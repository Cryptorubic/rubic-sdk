import { BLOCKCHAIN_NAME } from 'src/core/blockchain/models/blockchain-name';

export const oneinchCcrSupportedChains = [
    BLOCKCHAIN_NAME.ETHEREUM,
    BLOCKCHAIN_NAME.OPTIMISM,
    // BLOCKCHAIN_NAME.ZK_SYNC, // currently fusion+ doesnt't support zkSync
    BLOCKCHAIN_NAME.BASE,
    BLOCKCHAIN_NAME.ARBITRUM,
    BLOCKCHAIN_NAME.BINANCE_SMART_CHAIN,
    BLOCKCHAIN_NAME.POLYGON,
    BLOCKCHAIN_NAME.GNOSIS,
    BLOCKCHAIN_NAME.AVALANCHE,
    BLOCKCHAIN_NAME.FANTOM,
    BLOCKCHAIN_NAME.KLAYTN,
    BLOCKCHAIN_NAME.AURORA
] as const;

export type OneinchCcrSupportedChain = (typeof oneinchCcrSupportedChains)[number];
