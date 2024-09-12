export const stargateV2BridgeToken = {
    USDC: 'USDC',
    USDT: 'USDT',
    METIS: 'METIS',
    mUSD: 'm.USDT',
    ETH: 'ETH',
    METH: 'mETH',
    WETH: 'WETH',
    USDCe: 'USDC.e'
} as const;

export type StargateV2BridgeToken =
    (typeof stargateV2BridgeToken)[keyof typeof stargateV2BridgeToken];
