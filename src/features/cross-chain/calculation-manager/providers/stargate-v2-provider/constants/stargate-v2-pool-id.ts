import { StargateV2BridgeToken, stargateV2BridgeToken } from './stargate-v2-bridge-token';
import { StargateV2SupportedBlockchains } from './stargate-v2-cross-chain-supported-blockchains';
import { stargateV2TokenAddress } from './stargate-v2-token-address';

const pools = {
    [stargateV2BridgeToken.USDC]: 1,
    [stargateV2BridgeToken.USDCe]: 1,
    [stargateV2BridgeToken.USDT]: 2,
    [stargateV2BridgeToken.mUSD]: 2,
    [stargateV2BridgeToken.ETH]: 13,
    [stargateV2BridgeToken.WETH]: 13,
    [stargateV2BridgeToken.METIS]: 17,
    [stargateV2BridgeToken.METH]: 22
} as const;

export const stargateV2PoolId: Record<StargateV2BridgeToken, number> = pools;
export type StargateV2PoolId = (typeof pools)[keyof typeof pools];

export function getTokenPoolByAddress(
    blockchain: StargateV2SupportedBlockchains,
    contractAddress: string
): number | null {
    const tokenAddress = contractAddress.toLowerCase();
    const tokenSymbol = stargateV2TokenAddress?.[blockchain]?.[tokenAddress];
    if (tokenSymbol) {
        return stargateV2PoolId[tokenSymbol];
    }
    return null;
}
