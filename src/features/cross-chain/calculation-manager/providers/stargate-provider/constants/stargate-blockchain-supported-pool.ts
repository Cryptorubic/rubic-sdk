import { BLOCKCHAIN_NAME } from 'src/core/blockchain/models/blockchain-name';

import { StargateCrossChainSupportedBlockchain } from './stargate-cross-chain-supported-blockchain';
import { StargateBridgeToken, stargatePoolId } from './stargate-pool-id';

export const stargateBlockchainSupportedPools: Record<
    StargateCrossChainSupportedBlockchain,
    number[]
> = {
    [BLOCKCHAIN_NAME.ETHEREUM]: [
        stargatePoolId[StargateBridgeToken.USDC],
        stargatePoolId[StargateBridgeToken.USDT],
        stargatePoolId[StargateBridgeToken.DAI],
        stargatePoolId[StargateBridgeToken.FRAX],
        stargatePoolId[StargateBridgeToken.USDD],
        stargatePoolId[StargateBridgeToken.ETH],
        stargatePoolId[StargateBridgeToken.sUSD],
        stargatePoolId[StargateBridgeToken.LUSD],
        stargatePoolId[StargateBridgeToken.MAI]
    ],
    [BLOCKCHAIN_NAME.BINANCE_SMART_CHAIN]: [
        stargatePoolId[StargateBridgeToken.USDT],
        stargatePoolId[StargateBridgeToken.BUSD],
        stargatePoolId[StargateBridgeToken.USDD],
        stargatePoolId[StargateBridgeToken.MAI]
    ],
    [BLOCKCHAIN_NAME.POLYGON]: [
        stargatePoolId[StargateBridgeToken.USDC],
        stargatePoolId[StargateBridgeToken.USDT],
        stargatePoolId[StargateBridgeToken.DAI],
        stargatePoolId[StargateBridgeToken.MAI]
    ],
    [BLOCKCHAIN_NAME.AVALANCHE]: [
        stargatePoolId[StargateBridgeToken.USDC],
        stargatePoolId[StargateBridgeToken.USDT],
        stargatePoolId[StargateBridgeToken.MAI],
        stargatePoolId[StargateBridgeToken.FRAX]
    ],
    [BLOCKCHAIN_NAME.FANTOM]: [stargatePoolId[StargateBridgeToken.USDC]],
    [BLOCKCHAIN_NAME.ARBITRUM]: [
        stargatePoolId[StargateBridgeToken.USDC],
        stargatePoolId[StargateBridgeToken.USDT],
        stargatePoolId[StargateBridgeToken.MAI],
        stargatePoolId[StargateBridgeToken.FRAX],
        stargatePoolId[StargateBridgeToken.ETH]
    ],
    [BLOCKCHAIN_NAME.OPTIMISM]: [
        stargatePoolId[StargateBridgeToken.USDC],
        stargatePoolId[StargateBridgeToken.DAI],
        stargatePoolId[StargateBridgeToken.MAI],
        stargatePoolId[StargateBridgeToken.FRAX],
        stargatePoolId[StargateBridgeToken.ETH],
        stargatePoolId[StargateBridgeToken.sUSD],
        stargatePoolId[StargateBridgeToken.LUSD]
    ],
    [BLOCKCHAIN_NAME.METIS]: [stargatePoolId[StargateBridgeToken.mUSD]]
};
