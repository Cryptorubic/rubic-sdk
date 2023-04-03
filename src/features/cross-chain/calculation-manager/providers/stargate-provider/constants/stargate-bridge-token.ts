export const stargateBridgeToken = {
    USDC: 'USDC',
    USDT: 'USDT',
    DAI: 'DAI',
    MAI: 'MAI',
    FRAX: 'FRAX',
    USDD: 'USDD',
    ETH: 'ETH',
    sUSD: 'sUSD',
    LUSD: 'LUSD',
    BUSD: 'BUSD',
    mUSD: 'm.USDT',
    METIS: 'METIS'
} as const;

export type StargateBridgeToken = (typeof stargateBridgeToken)[keyof typeof stargateBridgeToken];
