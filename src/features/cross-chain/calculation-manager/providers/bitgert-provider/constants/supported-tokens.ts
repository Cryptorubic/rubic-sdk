import { BLOCKCHAIN_NAME } from 'src/core/blockchain/models/blockchain-name';

export const supportedTokens: Record<string, string[]> = {
    [BLOCKCHAIN_NAME.ETHEREUM]: ['USDC', 'USDT', 'BUSD', 'SHIB', 'MATIC', 'ETH'],
    [BLOCKCHAIN_NAME.BINANCE_SMART_CHAIN]: ['USDC', 'USDT', 'BUSD', 'BNB', 'BRISE'],
    [BLOCKCHAIN_NAME.BITGERT]: ['USDC', 'USDT', 'BUSD', 'ETH', 'SHIB', 'MATIC', 'BRISE', 'BNB']
};
