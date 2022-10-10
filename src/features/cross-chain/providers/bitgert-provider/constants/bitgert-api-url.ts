export const bitgertApiUrl: {
    baseUrl: string;
    swap: Record<string, string>;
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
    }
};
