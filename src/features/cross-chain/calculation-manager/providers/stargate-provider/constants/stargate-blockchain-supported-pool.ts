import { BLOCKCHAIN_NAME } from 'src/core/blockchain/models/blockchain-name';
import { stargateBridgeToken } from 'src/features/cross-chain/calculation-manager/providers/stargate-provider/constants/stargate-bridge-token';
import { stargatePoolId } from 'src/features/cross-chain/calculation-manager/providers/stargate-provider/constants/stargate-pool-id';

import { StargateCrossChainSupportedBlockchain } from './stargate-cross-chain-supported-blockchain';

export const stargateBlockchainSupportedPools: Record<
    StargateCrossChainSupportedBlockchain,
    number[]
> = {
    [BLOCKCHAIN_NAME.ETHEREUM]: [
        stargatePoolId[stargateBridgeToken.USDC],
        stargatePoolId[stargateBridgeToken.USDT],
        stargatePoolId[stargateBridgeToken.DAI],
        stargatePoolId[stargateBridgeToken.FRAX],
        stargatePoolId[stargateBridgeToken.USDD],
        stargatePoolId[stargateBridgeToken.ETH],
        stargatePoolId[stargateBridgeToken.sUSD],
        stargatePoolId[stargateBridgeToken.LUSD],
        stargatePoolId[stargateBridgeToken.MAI],
        stargatePoolId[stargateBridgeToken.METIS]
    ],
    [BLOCKCHAIN_NAME.BINANCE_SMART_CHAIN]: [
        stargatePoolId[stargateBridgeToken.USDT],
        stargatePoolId[stargateBridgeToken.BUSD],
        stargatePoolId[stargateBridgeToken.USDD],
        stargatePoolId[stargateBridgeToken.MAI],
        stargatePoolId[stargateBridgeToken.METIS]
    ],
    [BLOCKCHAIN_NAME.POLYGON]: [
        stargatePoolId[stargateBridgeToken.USDC],
        stargatePoolId[stargateBridgeToken.USDT],
        stargatePoolId[stargateBridgeToken.DAI],
        stargatePoolId[stargateBridgeToken.MAI]
    ],
    [BLOCKCHAIN_NAME.AVALANCHE]: [
        stargatePoolId[stargateBridgeToken.USDC],
        stargatePoolId[stargateBridgeToken.USDT],
        stargatePoolId[stargateBridgeToken.MAI],
        stargatePoolId[stargateBridgeToken.FRAX],
        stargatePoolId[stargateBridgeToken.METIS]
    ],
    [BLOCKCHAIN_NAME.FANTOM]: [stargatePoolId[stargateBridgeToken.FUSDC]],
    [BLOCKCHAIN_NAME.ARBITRUM]: [
        stargatePoolId[stargateBridgeToken.USDC],
        stargatePoolId[stargateBridgeToken.USDT],
        stargatePoolId[stargateBridgeToken.MAI],
        stargatePoolId[stargateBridgeToken.FRAX],
        stargatePoolId[stargateBridgeToken.ETH]
    ],
    [BLOCKCHAIN_NAME.OPTIMISM]: [
        stargatePoolId[stargateBridgeToken.USDC],
        stargatePoolId[stargateBridgeToken.DAI],
        stargatePoolId[stargateBridgeToken.MAI],
        stargatePoolId[stargateBridgeToken.FRAX],
        stargatePoolId[stargateBridgeToken.ETH],
        stargatePoolId[stargateBridgeToken.sUSD],
        stargatePoolId[stargateBridgeToken.LUSD]
    ],
    [BLOCKCHAIN_NAME.METIS]: [
        stargatePoolId[stargateBridgeToken.mUSD],
        stargatePoolId[stargateBridgeToken.METIS]
    ],
    [BLOCKCHAIN_NAME.BASE]: [
        stargatePoolId[stargateBridgeToken.USDC],
        stargatePoolId[stargateBridgeToken.ETH]
    ]
};
