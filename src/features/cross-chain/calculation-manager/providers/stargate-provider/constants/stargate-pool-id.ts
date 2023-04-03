import {
    StargateBridgeToken,
    stargateBridgeToken
} from 'src/features/cross-chain/calculation-manager/providers/stargate-provider/constants/stargate-bridge-token';

const pools = {
    [stargateBridgeToken.USDC]: 1,
    [stargateBridgeToken.USDT]: 2,
    [stargateBridgeToken.DAI]: 3,
    [stargateBridgeToken.BUSD]: 5,
    [stargateBridgeToken.FRAX]: 7,
    [stargateBridgeToken.USDD]: 11,
    [stargateBridgeToken.ETH]: 13,
    [stargateBridgeToken.sUSD]: 14,
    [stargateBridgeToken.LUSD]: 15,
    [stargateBridgeToken.MAI]: 16,
    [stargateBridgeToken.METIS]: 17,
    [stargateBridgeToken.mUSD]: 19
} as const;

export const stargatePoolId: Record<StargateBridgeToken, number> = pools;

export type StargatePoolId = (typeof pools)[keyof typeof pools];
