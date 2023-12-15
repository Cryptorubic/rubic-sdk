export const stargateBridgeToken = {
    USDC: 'USDC',
    USDT: 'USDT',
    DAI: 'DAI',
    // MAI: 'MAI',
    FRAX: 'FRAX',
    USDD: 'USDD',
    sUSD: 'sUSD',
    LUSD: 'LUSD',
    // BUSD: 'BUSD',
    mUSD: 'm.USDT',
    METIS: 'METIS',
    // ETHs
    ETH: 'ETH',
    WETH: 'WETH',
    SGETH: 'SGETH',
    AETH: 'AETH',
    FUSDC: 'FUSDC'
} as const;

export type StargateBridgeToken = (typeof stargateBridgeToken)[keyof typeof stargateBridgeToken];
