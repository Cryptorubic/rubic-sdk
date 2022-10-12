export const bitgertApiUrl: {
    baseUrl: string;
    healthcheck: string;
    transactionStatus: string;
    swap: Record<string, string>;
} = {
    baseUrl: 'https://bitgert.rubic.exchange/api/',
    healthcheck: 'healthcheck',
    transactionStatus: 'get_transaction',
    swap: {
        BRISE: 'proxy/swap',
        BNB: 'proxy/swapBnb',
        BUSD: 'proxy/swapbusd',
        ETH: 'proxy/swapEth',
        MATIC: 'proxy/swapMatic',
        SHIB: 'proxy/swapShib',
        USDC: 'proxy/swapUsdc',
        USDT: 'proxy/swapUsdt'
    }
};
