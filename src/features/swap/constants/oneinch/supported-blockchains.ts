import { BLOCKCHAIN_NAME } from '@core/blockchain/models/BLOCKCHAIN_NAME';

export const oneinchSupportedBlockchains = [
    BLOCKCHAIN_NAME.ETHEREUM,
    BLOCKCHAIN_NAME.BINANCE_SMART_CHAIN,
    BLOCKCHAIN_NAME.POLYGON
] as const;

export type OneinchSupportedBlockchain = typeof oneinchSupportedBlockchains[number];

export function isOneinchSupportedBlockchain(
    blockchain: BLOCKCHAIN_NAME
): blockchain is OneinchSupportedBlockchain {
    return oneinchSupportedBlockchains.some(
        supportedBlockchain => supportedBlockchain === blockchain
    );
}
