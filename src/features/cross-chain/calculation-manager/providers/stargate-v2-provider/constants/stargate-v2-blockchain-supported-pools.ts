import { BLOCKCHAIN_NAME } from 'src/core/blockchain/models/blockchain-name';

import { stargateV2BridgeToken } from './stargate-v2-bridge-token';
import { StargateV2SupportedBlockchains } from './stargate-v2-cross-chain-supported-blockchains';
import { stargateV2PoolId } from './stargate-v2-pool-id';

export const stargateV2BlockchainSupportedPools: Record<StargateV2SupportedBlockchains, number[]> =
    {
        [BLOCKCHAIN_NAME.ETHEREUM]: [
            stargateV2PoolId[stargateV2BridgeToken.USDC],
            stargateV2PoolId[stargateV2BridgeToken.USDT],
            stargateV2PoolId[stargateV2BridgeToken.ETH],
            // stargateV2PoolId[stargateV2BridgeToken.METIS],
            stargateV2PoolId[stargateV2BridgeToken.METH]
        ],
        [BLOCKCHAIN_NAME.BINANCE_SMART_CHAIN]: [
            stargateV2PoolId[stargateV2BridgeToken.USDT],
            stargateV2PoolId[stargateV2BridgeToken.USDC]
        ],
        [BLOCKCHAIN_NAME.AVALANCHE]: [
            stargateV2PoolId[stargateV2BridgeToken.USDC],
            stargateV2PoolId[stargateV2BridgeToken.USDT]
        ],
        [BLOCKCHAIN_NAME.POLYGON]: [
            stargateV2PoolId[stargateV2BridgeToken.USDC],
            stargateV2PoolId[stargateV2BridgeToken.USDT]
        ],
        [BLOCKCHAIN_NAME.ARBITRUM]: [
            stargateV2PoolId[stargateV2BridgeToken.USDC],
            stargateV2PoolId[stargateV2BridgeToken.USDT],
            stargateV2PoolId[stargateV2BridgeToken.ETH]
        ],
        [BLOCKCHAIN_NAME.OPTIMISM]: [
            stargateV2PoolId[stargateV2BridgeToken.USDC],
            stargateV2PoolId[stargateV2BridgeToken.USDT],
            stargateV2PoolId[stargateV2BridgeToken.ETH]
        ],
        [BLOCKCHAIN_NAME.METIS]: [
            stargateV2PoolId[stargateV2BridgeToken.mUSD],
            stargateV2PoolId[stargateV2BridgeToken.WETH]
            // stargateV2PoolId[stargateV2BridgeToken.METIS]
        ],
        [BLOCKCHAIN_NAME.LINEA]: [stargateV2PoolId[stargateV2BridgeToken.ETH]],
        [BLOCKCHAIN_NAME.MANTLE]: [
            stargateV2PoolId[stargateV2BridgeToken.USDC],
            stargateV2PoolId[stargateV2BridgeToken.USDT],
            stargateV2PoolId[stargateV2BridgeToken.WETH],
            stargateV2PoolId[stargateV2BridgeToken.METH]
        ],
        [BLOCKCHAIN_NAME.BASE]: [
            stargateV2PoolId[stargateV2BridgeToken.USDC],
            stargateV2PoolId[stargateV2BridgeToken.ETH]
        ],
        [BLOCKCHAIN_NAME.KAVA]: [stargateV2PoolId[stargateV2BridgeToken.USDT]],
        [BLOCKCHAIN_NAME.SCROLL]: [
            stargateV2PoolId[stargateV2BridgeToken.USDCe],
            stargateV2PoolId[stargateV2BridgeToken.ETH]
        ],
        [BLOCKCHAIN_NAME.AURORA]: [stargateV2PoolId[stargateV2BridgeToken.USDC]],
        // [BLOCKCHAIN_NAME.KLAYTN]: [
        //     stargateV2PoolId[stargateV2BridgeToken.USDC],
        //     stargateV2PoolId[stargateV2BridgeToken.USDT],
        //     stargateV2PoolId[stargateV2BridgeToken.WETH]
        // ],
        // [BLOCKCHAIN_NAME.IOTA]: [
        //     stargateV2PoolId[stargateV2BridgeToken.USDC],
        //     stargateV2PoolId[stargateV2BridgeToken.USDT],
        //     stargateV2PoolId[stargateV2BridgeToken.WETH]
        // ],
        [BLOCKCHAIN_NAME.TAIKO]: [
            stargateV2PoolId[stargateV2BridgeToken.USDC],
            stargateV2PoolId[stargateV2BridgeToken.USDT]
        ],
        [BLOCKCHAIN_NAME.SEI]: [stargateV2PoolId[stargateV2BridgeToken.WETH]],
        [BLOCKCHAIN_NAME.FLARE]: [
            stargateV2PoolId[stargateV2BridgeToken.USDC],
            stargateV2PoolId[stargateV2BridgeToken.USDT],
            stargateV2PoolId[stargateV2BridgeToken.WETH]
        ],
        [BLOCKCHAIN_NAME.GRAVITY]: [
            stargateV2PoolId[stargateV2BridgeToken.USDC],
            stargateV2PoolId[stargateV2BridgeToken.USDT],
            stargateV2PoolId[stargateV2BridgeToken.WETH]
        ],
        [BLOCKCHAIN_NAME.BERACHAIN]: [
            stargateV2PoolId[stargateV2BridgeToken.WETH],
            stargateV2PoolId[stargateV2BridgeToken.USDC]
        ],
        [BLOCKCHAIN_NAME.VANA]: [
            stargateV2PoolId[stargateV2BridgeToken.WETH],
            stargateV2PoolId[stargateV2BridgeToken.USDC],
            stargateV2PoolId[stargateV2BridgeToken.USDT]
        ]
    };
