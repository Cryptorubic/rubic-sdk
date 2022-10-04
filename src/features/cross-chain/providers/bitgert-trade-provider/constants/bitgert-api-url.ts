export const bitgertApiUrl: {
    baseUrl: string;
    swap: Record<string, string>;
    swapRetry: Record<string, string>;
    txList: Record<string, string>;
} = {
    baseUrl: 'https://dev-bitgert.rubic.exchange/api/',
    swap: {
        BRISE: 'swap',
        BNB: 'swapBnb',
        BUSD: 'swapbusd',
        ETH: 'swapEth',
        MATIC: 'swapMatic',
        SHIB: 'swapShib',
        USDC: 'swapUsdc',
        USDT: 'swapUsdt'
    },
    swapRetry: {
        BRISE: 'retrySwap',
        BNB: 'retryBnbSwap',
        BUSD: 'retrybusdSwap',
        ETH: 'retryEthSwap',
        MATIC: 'retryMaticSwap',
        SHIB: 'retryShibSwap',
        USDC: 'retryUsdcSwap',
        USDT: 'retryUsdtSwap'
    },
    txList: {
        BRISE: 'getTransactions',
        BNB: 'getBnbTransactions',
        BUSD: 'getbusdTransactions',
        ETH: 'getEthTransactions',
        MATIC: 'getMaticTransactions',
        SHIB: 'getShibTransactions',
        USDC: 'getUsdcTransactions',
        USDT: 'getUsdtTransactions'
    }
};
