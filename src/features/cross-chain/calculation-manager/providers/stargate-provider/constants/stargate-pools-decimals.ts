import {
    StargateBridgeToken,
    stargateBridgeToken
} from 'src/features/cross-chain/calculation-manager/providers/stargate-provider/constants/stargate-bridge-token';

export const stargatePoolsDecimals: Record<StargateBridgeToken, number> = {
    [stargateBridgeToken.USDC]: 6,
    [stargateBridgeToken.USDT]: 6,
    [stargateBridgeToken.DAI]: 6,
    [stargateBridgeToken.MAI]: 6,
    [stargateBridgeToken.FRAX]: 18,
    [stargateBridgeToken.USDD]: 18,
    [stargateBridgeToken.sUSD]: 6,
    [stargateBridgeToken.LUSD]: 6,
    [stargateBridgeToken.BUSD]: 6,
    [stargateBridgeToken.mUSD]: 6,
    [stargateBridgeToken.FUSDC]: 6,
    [stargateBridgeToken.METIS]: 18,
    // ETHs
    [stargateBridgeToken.ETH]: 18,
    [stargateBridgeToken.WETH]: 18,
    [stargateBridgeToken.AETH]: 18,
    [stargateBridgeToken.SGETH]: 18
};
