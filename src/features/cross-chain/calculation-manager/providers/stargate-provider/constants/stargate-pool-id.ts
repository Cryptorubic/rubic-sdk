/* eslint-disable @typescript-eslint/naming-convention */

export enum StargateBridgeToken {
    USDC = 'USDC',
    USDT = 'USDT',
    DAI = 'DAI',
    MAI = 'MAI',
    FRAX = 'FRAX',
    USDD = 'USDD',
    ETH = 'ETH',
    sUSD = 'sUSD',
    LUSD = 'LUSD',
    BUSD = 'BUSD',
    mUSD = 'm.USDT'
}

export const stargatePoolId: Record<StargateBridgeToken, number> = {
    [StargateBridgeToken.USDC]: 1,
    [StargateBridgeToken.USDT]: 2,
    [StargateBridgeToken.DAI]: 3,
    [StargateBridgeToken.MAI]: 16,
    [StargateBridgeToken.FRAX]: 7,
    [StargateBridgeToken.USDD]: 11,
    [StargateBridgeToken.ETH]: 13,
    [StargateBridgeToken.sUSD]: 14,
    [StargateBridgeToken.LUSD]: 15,
    [StargateBridgeToken.BUSD]: 5,
    [StargateBridgeToken.mUSD]: 19
};
