import { BLOCKCHAIN_NAME } from 'src/core/blockchain/models/blockchain-name';
import {
    StargateBridgeToken,
    stargateBridgeToken
} from 'src/features/cross-chain/calculation-manager/providers/stargate-provider/constants/stargate-bridge-token';
import { StargateCrossChainSupportedBlockchain } from 'src/features/cross-chain/calculation-manager/providers/stargate-provider/constants/stargate-cross-chain-supported-blockchain';
import { stargatePoolId } from 'src/features/cross-chain/calculation-manager/providers/stargate-provider/constants/stargate-pool-id';

type StargatePoolMapping = Record<
    StargateCrossChainSupportedBlockchain,
    Partial<
        Record<
            StargateBridgeToken,
            Partial<Record<StargateCrossChainSupportedBlockchain, number[]>>
        >
    >
>;

export const stargatePoolMapping: StargatePoolMapping = {
    [BLOCKCHAIN_NAME.ETHEREUM]: {
        [stargateBridgeToken.USDC]: {
            [BLOCKCHAIN_NAME.BINANCE_SMART_CHAIN]: [
                stargatePoolId[stargateBridgeToken.BUSD],
                stargatePoolId[stargateBridgeToken.USDT]
            ],
            [BLOCKCHAIN_NAME.POLYGON]: [
                stargatePoolId[stargateBridgeToken.USDT],
                stargatePoolId[stargateBridgeToken.USDC]
            ],
            [BLOCKCHAIN_NAME.AVALANCHE]: [
                stargatePoolId[stargateBridgeToken.USDT],
                stargatePoolId[stargateBridgeToken.USDC]
            ],
            [BLOCKCHAIN_NAME.FANTOM]: [stargatePoolId[stargateBridgeToken.USDC]],
            [BLOCKCHAIN_NAME.ARBITRUM]: [
                stargatePoolId[stargateBridgeToken.USDT],
                stargatePoolId[stargateBridgeToken.USDC]
            ],
            [BLOCKCHAIN_NAME.OPTIMISM]: [stargatePoolId[stargateBridgeToken.USDC]],
            [BLOCKCHAIN_NAME.BASE]: [
                stargatePoolId[stargateBridgeToken.USDC],
                stargatePoolId[stargateBridgeToken.ETH]
            ]
        },
        [stargateBridgeToken.USDT]: {
            [BLOCKCHAIN_NAME.BINANCE_SMART_CHAIN]: [
                stargatePoolId[stargateBridgeToken.BUSD],
                stargatePoolId[stargateBridgeToken.USDT]
            ],
            [BLOCKCHAIN_NAME.AVALANCHE]: [
                stargatePoolId[stargateBridgeToken.USDT],
                stargatePoolId[stargateBridgeToken.USDC]
            ],
            [BLOCKCHAIN_NAME.POLYGON]: [
                stargatePoolId[stargateBridgeToken.USDT],
                stargatePoolId[stargateBridgeToken.USDC]
            ],
            [BLOCKCHAIN_NAME.ARBITRUM]: [
                stargatePoolId[stargateBridgeToken.USDT],
                stargatePoolId[stargateBridgeToken.USDC]
            ],
            [BLOCKCHAIN_NAME.OPTIMISM]: [stargatePoolId[stargateBridgeToken.USDC]],
            [BLOCKCHAIN_NAME.FANTOM]: [stargatePoolId[stargateBridgeToken.USDC]],
            [BLOCKCHAIN_NAME.METIS]: [stargatePoolId[stargateBridgeToken.USDT]]
        },
        [stargateBridgeToken.DAI]: {
            [BLOCKCHAIN_NAME.POLYGON]: [stargatePoolId[stargateBridgeToken.DAI]],
            [BLOCKCHAIN_NAME.OPTIMISM]: [stargatePoolId[stargateBridgeToken.DAI]]
        },
        [stargateBridgeToken.MAI]: {
            [BLOCKCHAIN_NAME.BINANCE_SMART_CHAIN]: [stargatePoolId[stargateBridgeToken.MAI]],
            [BLOCKCHAIN_NAME.AVALANCHE]: [stargatePoolId[stargateBridgeToken.MAI]],
            [BLOCKCHAIN_NAME.POLYGON]: [stargatePoolId[stargateBridgeToken.MAI]],
            [BLOCKCHAIN_NAME.ARBITRUM]: [stargatePoolId[stargateBridgeToken.MAI]],
            [BLOCKCHAIN_NAME.OPTIMISM]: [stargatePoolId[stargateBridgeToken.MAI]]
        },
        [stargateBridgeToken.FRAX]: {
            [BLOCKCHAIN_NAME.AVALANCHE]: [stargatePoolId[stargateBridgeToken.FRAX]],
            [BLOCKCHAIN_NAME.ARBITRUM]: [stargatePoolId[stargateBridgeToken.FRAX]],
            [BLOCKCHAIN_NAME.OPTIMISM]: [stargatePoolId[stargateBridgeToken.FRAX]]
        },
        [stargateBridgeToken.USDD]: {
            [BLOCKCHAIN_NAME.BINANCE_SMART_CHAIN]: [stargatePoolId[stargateBridgeToken.USDD]]
        },
        [stargateBridgeToken.ETH]: {
            [BLOCKCHAIN_NAME.ARBITRUM]: [stargatePoolId[stargateBridgeToken.ETH]],
            [BLOCKCHAIN_NAME.OPTIMISM]: [stargatePoolId[stargateBridgeToken.ETH]]
        },
        [stargateBridgeToken.sUSD]: {
            [BLOCKCHAIN_NAME.OPTIMISM]: [stargatePoolId[stargateBridgeToken.sUSD]]
        },
        [stargateBridgeToken.LUSD]: {
            [BLOCKCHAIN_NAME.ARBITRUM]: [stargatePoolId[stargateBridgeToken.LUSD]],
            [BLOCKCHAIN_NAME.OPTIMISM]: [stargatePoolId[stargateBridgeToken.LUSD]]
        },
        [stargateBridgeToken.METIS]: {
            [BLOCKCHAIN_NAME.BINANCE_SMART_CHAIN]: [stargatePoolId[stargateBridgeToken.METIS]],
            [BLOCKCHAIN_NAME.METIS]: [stargatePoolId[stargateBridgeToken.METIS]]
        }
    },
    [BLOCKCHAIN_NAME.BINANCE_SMART_CHAIN]: {
        [stargateBridgeToken.USDT]: {
            [BLOCKCHAIN_NAME.ETHEREUM]: [
                stargatePoolId[stargateBridgeToken.BUSD],
                stargatePoolId[stargateBridgeToken.USDT]
            ],
            [BLOCKCHAIN_NAME.AVALANCHE]: [
                stargatePoolId[stargateBridgeToken.USDT],
                stargatePoolId[stargateBridgeToken.USDC]
            ],
            [BLOCKCHAIN_NAME.POLYGON]: [
                stargatePoolId[stargateBridgeToken.USDT],
                stargatePoolId[stargateBridgeToken.USDC]
            ],
            [BLOCKCHAIN_NAME.ARBITRUM]: [
                stargatePoolId[stargateBridgeToken.USDT],
                stargatePoolId[stargateBridgeToken.USDC]
            ],
            [BLOCKCHAIN_NAME.OPTIMISM]: [stargatePoolId[stargateBridgeToken.USDC]],
            [BLOCKCHAIN_NAME.FANTOM]: [stargatePoolId[stargateBridgeToken.USDC]],
            [BLOCKCHAIN_NAME.METIS]: [stargatePoolId[stargateBridgeToken.mUSD]],
            [BLOCKCHAIN_NAME.BASE]: [stargatePoolId[stargateBridgeToken.USDC]]
        },
        [stargateBridgeToken.BUSD]: {
            [BLOCKCHAIN_NAME.ETHEREUM]: [
                stargatePoolId[stargateBridgeToken.USDT],
                stargatePoolId[stargateBridgeToken.USDC]
            ],
            [BLOCKCHAIN_NAME.AVALANCHE]: [
                stargatePoolId[stargateBridgeToken.USDT],
                stargatePoolId[stargateBridgeToken.USDC]
            ],
            [BLOCKCHAIN_NAME.POLYGON]: [
                stargatePoolId[stargateBridgeToken.USDT],
                stargatePoolId[stargateBridgeToken.USDC]
            ],
            [BLOCKCHAIN_NAME.ARBITRUM]: [
                stargatePoolId[stargateBridgeToken.USDT],
                stargatePoolId[stargateBridgeToken.USDC]
            ],
            [BLOCKCHAIN_NAME.OPTIMISM]: [stargatePoolId[stargateBridgeToken.USDC]],
            [BLOCKCHAIN_NAME.FANTOM]: [stargatePoolId[stargateBridgeToken.USDC]]
        },
        [stargateBridgeToken.USDD]: {
            [BLOCKCHAIN_NAME.ETHEREUM]: [stargatePoolId[stargateBridgeToken.USDD]]
        },
        [stargateBridgeToken.MAI]: {
            [BLOCKCHAIN_NAME.ETHEREUM]: [stargatePoolId[stargateBridgeToken.MAI]],
            [BLOCKCHAIN_NAME.AVALANCHE]: [stargatePoolId[stargateBridgeToken.MAI]],
            [BLOCKCHAIN_NAME.POLYGON]: [stargatePoolId[stargateBridgeToken.MAI]],
            [BLOCKCHAIN_NAME.ARBITRUM]: [stargatePoolId[stargateBridgeToken.MAI]],
            [BLOCKCHAIN_NAME.OPTIMISM]: [stargatePoolId[stargateBridgeToken.MAI]]
        },
        [stargateBridgeToken.METIS]: {
            [BLOCKCHAIN_NAME.ETHEREUM]: [stargatePoolId[stargateBridgeToken.METIS]],
            [BLOCKCHAIN_NAME.METIS]: [stargatePoolId[stargateBridgeToken.METIS]]
        }
    },
    [BLOCKCHAIN_NAME.POLYGON]: {
        [stargateBridgeToken.USDC]: {
            [BLOCKCHAIN_NAME.ETHEREUM]: [
                stargatePoolId[stargateBridgeToken.USDT],
                stargatePoolId[stargateBridgeToken.USDC]
            ],
            [BLOCKCHAIN_NAME.BINANCE_SMART_CHAIN]: [
                stargatePoolId[stargateBridgeToken.BUSD],
                stargatePoolId[stargateBridgeToken.USDT]
            ],
            [BLOCKCHAIN_NAME.AVALANCHE]: [
                stargatePoolId[stargateBridgeToken.USDT],
                stargatePoolId[stargateBridgeToken.USDC]
            ],
            [BLOCKCHAIN_NAME.FANTOM]: [stargatePoolId[stargateBridgeToken.USDC]],
            [BLOCKCHAIN_NAME.ARBITRUM]: [
                stargatePoolId[stargateBridgeToken.USDT],
                stargatePoolId[stargateBridgeToken.USDC]
            ],
            [BLOCKCHAIN_NAME.OPTIMISM]: [stargatePoolId[stargateBridgeToken.USDC]]
        },
        [stargateBridgeToken.USDT]: {
            [BLOCKCHAIN_NAME.BINANCE_SMART_CHAIN]: [
                stargatePoolId[stargateBridgeToken.BUSD],
                stargatePoolId[stargateBridgeToken.USDT]
            ],
            [BLOCKCHAIN_NAME.AVALANCHE]: [
                stargatePoolId[stargateBridgeToken.USDT],
                stargatePoolId[stargateBridgeToken.USDC]
            ],
            [BLOCKCHAIN_NAME.ETHEREUM]: [
                stargatePoolId[stargateBridgeToken.USDT],
                stargatePoolId[stargateBridgeToken.USDC]
            ],
            [BLOCKCHAIN_NAME.ARBITRUM]: [
                stargatePoolId[stargateBridgeToken.USDT],
                stargatePoolId[stargateBridgeToken.USDC]
            ],
            [BLOCKCHAIN_NAME.OPTIMISM]: [stargatePoolId[stargateBridgeToken.USDC]],
            [BLOCKCHAIN_NAME.FANTOM]: [stargatePoolId[stargateBridgeToken.USDC]],
            [BLOCKCHAIN_NAME.METIS]: [stargatePoolId[stargateBridgeToken.mUSD]],
            [BLOCKCHAIN_NAME.BASE]: [stargatePoolId[stargateBridgeToken.USDC]]
        },
        [stargateBridgeToken.DAI]: {
            [BLOCKCHAIN_NAME.ETHEREUM]: [stargatePoolId[stargateBridgeToken.DAI]],
            [BLOCKCHAIN_NAME.OPTIMISM]: [stargatePoolId[stargateBridgeToken.DAI]]
        },
        [stargateBridgeToken.MAI]: {
            [BLOCKCHAIN_NAME.BINANCE_SMART_CHAIN]: [stargatePoolId[stargateBridgeToken.MAI]],
            [BLOCKCHAIN_NAME.AVALANCHE]: [stargatePoolId[stargateBridgeToken.MAI]],
            [BLOCKCHAIN_NAME.ETHEREUM]: [stargatePoolId[stargateBridgeToken.MAI]],
            [BLOCKCHAIN_NAME.ARBITRUM]: [stargatePoolId[stargateBridgeToken.MAI]],
            [BLOCKCHAIN_NAME.OPTIMISM]: [stargatePoolId[stargateBridgeToken.MAI]]
        }
    },
    [BLOCKCHAIN_NAME.AVALANCHE]: {
        [stargateBridgeToken.USDC]: {
            [BLOCKCHAIN_NAME.BINANCE_SMART_CHAIN]: [
                stargatePoolId[stargateBridgeToken.BUSD],
                stargatePoolId[stargateBridgeToken.USDT]
            ],
            [BLOCKCHAIN_NAME.POLYGON]: [
                stargatePoolId[stargateBridgeToken.USDT],
                stargatePoolId[stargateBridgeToken.USDC]
            ],
            [BLOCKCHAIN_NAME.ETHEREUM]: [
                stargatePoolId[stargateBridgeToken.USDT],
                stargatePoolId[stargateBridgeToken.USDC]
            ],
            [BLOCKCHAIN_NAME.FANTOM]: [stargatePoolId[stargateBridgeToken.USDC]],
            [BLOCKCHAIN_NAME.ARBITRUM]: [
                stargatePoolId[stargateBridgeToken.USDT],
                stargatePoolId[stargateBridgeToken.USDC]
            ],
            [BLOCKCHAIN_NAME.OPTIMISM]: [stargatePoolId[stargateBridgeToken.USDC]],
            [BLOCKCHAIN_NAME.BASE]: [stargatePoolId[stargateBridgeToken.USDC]]
        },
        [stargateBridgeToken.USDT]: {
            [BLOCKCHAIN_NAME.BINANCE_SMART_CHAIN]: [
                stargatePoolId[stargateBridgeToken.BUSD],
                stargatePoolId[stargateBridgeToken.USDT]
            ],
            [BLOCKCHAIN_NAME.ETHEREUM]: [
                stargatePoolId[stargateBridgeToken.USDT],
                stargatePoolId[stargateBridgeToken.USDC]
            ],
            [BLOCKCHAIN_NAME.POLYGON]: [
                stargatePoolId[stargateBridgeToken.USDT],
                stargatePoolId[stargateBridgeToken.USDC]
            ],
            [BLOCKCHAIN_NAME.ARBITRUM]: [
                stargatePoolId[stargateBridgeToken.USDT],
                stargatePoolId[stargateBridgeToken.USDC]
            ],
            [BLOCKCHAIN_NAME.OPTIMISM]: [stargatePoolId[stargateBridgeToken.USDC]],
            [BLOCKCHAIN_NAME.FANTOM]: [stargatePoolId[stargateBridgeToken.USDC]],
            [BLOCKCHAIN_NAME.METIS]: [stargatePoolId[stargateBridgeToken.mUSD]]
        },
        [stargateBridgeToken.MAI]: {
            [BLOCKCHAIN_NAME.BINANCE_SMART_CHAIN]: [stargatePoolId[stargateBridgeToken.MAI]],
            [BLOCKCHAIN_NAME.ETHEREUM]: [stargatePoolId[stargateBridgeToken.MAI]],
            [BLOCKCHAIN_NAME.POLYGON]: [stargatePoolId[stargateBridgeToken.MAI]],
            [BLOCKCHAIN_NAME.ARBITRUM]: [stargatePoolId[stargateBridgeToken.MAI]],
            [BLOCKCHAIN_NAME.OPTIMISM]: [stargatePoolId[stargateBridgeToken.MAI]]
        }
    },
    [BLOCKCHAIN_NAME.FANTOM]: {
        [stargateBridgeToken.USDC]: {
            [BLOCKCHAIN_NAME.BINANCE_SMART_CHAIN]: [
                stargatePoolId[stargateBridgeToken.BUSD],
                stargatePoolId[stargateBridgeToken.USDT]
            ],
            [BLOCKCHAIN_NAME.POLYGON]: [
                stargatePoolId[stargateBridgeToken.USDT],
                stargatePoolId[stargateBridgeToken.USDC]
            ],
            [BLOCKCHAIN_NAME.ETHEREUM]: [
                stargatePoolId[stargateBridgeToken.USDT],
                stargatePoolId[stargateBridgeToken.USDC]
            ],
            [BLOCKCHAIN_NAME.AVALANCHE]: [
                stargatePoolId[stargateBridgeToken.USDC],
                stargatePoolId[stargateBridgeToken.USDT]
            ],
            [BLOCKCHAIN_NAME.ARBITRUM]: [
                stargatePoolId[stargateBridgeToken.USDT],
                stargatePoolId[stargateBridgeToken.USDC]
            ],
            [BLOCKCHAIN_NAME.OPTIMISM]: [stargatePoolId[stargateBridgeToken.USDC]]
        }
    },
    [BLOCKCHAIN_NAME.ARBITRUM]: {
        [stargateBridgeToken.USDC]: {
            [BLOCKCHAIN_NAME.ETHEREUM]: [
                stargatePoolId[stargateBridgeToken.USDT],
                stargatePoolId[stargateBridgeToken.USDC]
            ],
            [BLOCKCHAIN_NAME.BINANCE_SMART_CHAIN]: [
                stargatePoolId[stargateBridgeToken.USDT],
                stargatePoolId[stargateBridgeToken.BUSD]
            ],
            [BLOCKCHAIN_NAME.POLYGON]: [
                stargatePoolId[stargateBridgeToken.USDT],
                stargatePoolId[stargateBridgeToken.USDC]
            ],
            [BLOCKCHAIN_NAME.AVALANCHE]: [
                stargatePoolId[stargateBridgeToken.USDT],
                stargatePoolId[stargateBridgeToken.USDC]
            ],
            [BLOCKCHAIN_NAME.OPTIMISM]: [stargatePoolId[stargateBridgeToken.USDC]],
            [BLOCKCHAIN_NAME.FANTOM]: [stargatePoolId[stargateBridgeToken.USDC]],
            [BLOCKCHAIN_NAME.BASE]: [
                stargatePoolId[stargateBridgeToken.USDC],
                stargatePoolId[stargateBridgeToken.ETH]
            ]
        },
        [stargateBridgeToken.USDT]: {
            [BLOCKCHAIN_NAME.BINANCE_SMART_CHAIN]: [
                stargatePoolId[stargateBridgeToken.BUSD],
                stargatePoolId[stargateBridgeToken.USDT]
            ],
            [BLOCKCHAIN_NAME.ETHEREUM]: [
                stargatePoolId[stargateBridgeToken.USDT],
                stargatePoolId[stargateBridgeToken.USDC]
            ],
            [BLOCKCHAIN_NAME.POLYGON]: [
                stargatePoolId[stargateBridgeToken.USDT],
                stargatePoolId[stargateBridgeToken.USDC]
            ],
            [BLOCKCHAIN_NAME.AVALANCHE]: [
                stargatePoolId[stargateBridgeToken.USDT],
                stargatePoolId[stargateBridgeToken.USDC]
            ],
            [BLOCKCHAIN_NAME.OPTIMISM]: [stargatePoolId[stargateBridgeToken.USDC]],
            [BLOCKCHAIN_NAME.FANTOM]: [stargatePoolId[stargateBridgeToken.USDC]],
            [BLOCKCHAIN_NAME.METIS]: [stargatePoolId[stargateBridgeToken.mUSD]]
        },
        [stargateBridgeToken.ETH]: {
            [BLOCKCHAIN_NAME.ETHEREUM]: [stargatePoolId[stargateBridgeToken.ETH]],
            [BLOCKCHAIN_NAME.OPTIMISM]: [stargatePoolId[stargateBridgeToken.ETH]]
        },
        [stargateBridgeToken.FRAX]: {
            [BLOCKCHAIN_NAME.AVALANCHE]: [stargatePoolId[stargateBridgeToken.FRAX]],
            [BLOCKCHAIN_NAME.ETHEREUM]: [stargatePoolId[stargateBridgeToken.FRAX]],
            [BLOCKCHAIN_NAME.OPTIMISM]: [stargatePoolId[stargateBridgeToken.FRAX]]
        },
        [stargateBridgeToken.MAI]: {
            [BLOCKCHAIN_NAME.BINANCE_SMART_CHAIN]: [stargatePoolId[stargateBridgeToken.MAI]],
            [BLOCKCHAIN_NAME.AVALANCHE]: [stargatePoolId[stargateBridgeToken.MAI]],
            [BLOCKCHAIN_NAME.POLYGON]: [stargatePoolId[stargateBridgeToken.MAI]],
            [BLOCKCHAIN_NAME.ETHEREUM]: [stargatePoolId[stargateBridgeToken.MAI]],
            [BLOCKCHAIN_NAME.OPTIMISM]: [stargatePoolId[stargateBridgeToken.MAI]]
        },
        [stargateBridgeToken.LUSD]: {
            [BLOCKCHAIN_NAME.ETHEREUM]: [stargatePoolId[stargateBridgeToken.LUSD]],
            [BLOCKCHAIN_NAME.OPTIMISM]: [stargatePoolId[stargateBridgeToken.LUSD]]
        }
    },
    [BLOCKCHAIN_NAME.OPTIMISM]: {
        [stargateBridgeToken.USDC]: {
            [BLOCKCHAIN_NAME.ETHEREUM]: [
                stargatePoolId[stargateBridgeToken.USDT],
                stargatePoolId[stargateBridgeToken.USDC]
            ],
            [BLOCKCHAIN_NAME.BINANCE_SMART_CHAIN]: [
                stargatePoolId[stargateBridgeToken.USDT],
                stargatePoolId[stargateBridgeToken.BUSD]
            ],
            [BLOCKCHAIN_NAME.POLYGON]: [
                stargatePoolId[stargateBridgeToken.USDT],
                stargatePoolId[stargateBridgeToken.USDC]
            ],
            [BLOCKCHAIN_NAME.AVALANCHE]: [
                stargatePoolId[stargateBridgeToken.USDT],
                stargatePoolId[stargateBridgeToken.USDC]
            ],
            [BLOCKCHAIN_NAME.ARBITRUM]: [stargatePoolId[stargateBridgeToken.USDC]],
            [BLOCKCHAIN_NAME.FANTOM]: [stargatePoolId[stargateBridgeToken.USDC]],
            [BLOCKCHAIN_NAME.BASE]: [
                stargatePoolId[stargateBridgeToken.USDC],
                stargatePoolId[stargateBridgeToken.ETH]
            ]
        },
        [stargateBridgeToken.USDT]: {
            [BLOCKCHAIN_NAME.BINANCE_SMART_CHAIN]: [
                stargatePoolId[stargateBridgeToken.BUSD],
                stargatePoolId[stargateBridgeToken.USDT]
            ],
            [BLOCKCHAIN_NAME.ETHEREUM]: [
                stargatePoolId[stargateBridgeToken.USDT],
                stargatePoolId[stargateBridgeToken.USDC]
            ],
            [BLOCKCHAIN_NAME.POLYGON]: [
                stargatePoolId[stargateBridgeToken.USDT],
                stargatePoolId[stargateBridgeToken.USDC]
            ],
            [BLOCKCHAIN_NAME.AVALANCHE]: [
                stargatePoolId[stargateBridgeToken.USDT],
                stargatePoolId[stargateBridgeToken.USDC]
            ],
            [BLOCKCHAIN_NAME.ARBITRUM]: [stargatePoolId[stargateBridgeToken.USDC]],
            [BLOCKCHAIN_NAME.FANTOM]: [stargatePoolId[stargateBridgeToken.USDC]],
            [BLOCKCHAIN_NAME.METIS]: [stargatePoolId[stargateBridgeToken.mUSD]]
        },
        [stargateBridgeToken.FRAX]: {
            [BLOCKCHAIN_NAME.AVALANCHE]: [stargatePoolId[stargateBridgeToken.FRAX]],
            [BLOCKCHAIN_NAME.ETHEREUM]: [stargatePoolId[stargateBridgeToken.FRAX]],
            [BLOCKCHAIN_NAME.ARBITRUM]: [stargatePoolId[stargateBridgeToken.FRAX]]
        },
        [stargateBridgeToken.MAI]: {
            [BLOCKCHAIN_NAME.BINANCE_SMART_CHAIN]: [stargatePoolId[stargateBridgeToken.MAI]],
            [BLOCKCHAIN_NAME.AVALANCHE]: [stargatePoolId[stargateBridgeToken.MAI]],
            [BLOCKCHAIN_NAME.POLYGON]: [stargatePoolId[stargateBridgeToken.MAI]],
            [BLOCKCHAIN_NAME.ETHEREUM]: [stargatePoolId[stargateBridgeToken.MAI]],
            [BLOCKCHAIN_NAME.ARBITRUM]: [stargatePoolId[stargateBridgeToken.MAI]]
        },
        [stargateBridgeToken.LUSD]: {
            [BLOCKCHAIN_NAME.ETHEREUM]: [stargatePoolId[stargateBridgeToken.LUSD]],
            [BLOCKCHAIN_NAME.ARBITRUM]: [stargatePoolId[stargateBridgeToken.LUSD]]
        },
        [stargateBridgeToken.DAI]: {
            [BLOCKCHAIN_NAME.ETHEREUM]: [stargatePoolId[stargateBridgeToken.DAI]],
            [BLOCKCHAIN_NAME.POLYGON]: [stargatePoolId[stargateBridgeToken.DAI]]
        },
        [stargateBridgeToken.sUSD]: {
            [BLOCKCHAIN_NAME.ETHEREUM]: [stargatePoolId[stargateBridgeToken.sUSD]]
        }
    },
    [BLOCKCHAIN_NAME.METIS]: {
        [stargateBridgeToken.METIS]: {
            [BLOCKCHAIN_NAME.ETHEREUM]: [stargatePoolId[stargateBridgeToken.METIS]],
            [BLOCKCHAIN_NAME.BINANCE_SMART_CHAIN]: [stargatePoolId[stargateBridgeToken.METIS]]
        },
        [stargateBridgeToken.mUSD]: {
            [BLOCKCHAIN_NAME.ETHEREUM]: [stargatePoolId[stargateBridgeToken.USDT]],
            [BLOCKCHAIN_NAME.BINANCE_SMART_CHAIN]: [stargatePoolId[stargateBridgeToken.USDT]],
            [BLOCKCHAIN_NAME.AVALANCHE]: [stargatePoolId[stargateBridgeToken.USDT]]
        }
    },
    [BLOCKCHAIN_NAME.BASE]: {
        [stargateBridgeToken.USDC]: {
            [BLOCKCHAIN_NAME.ETHEREUM]: [stargatePoolId[stargateBridgeToken.USDC]],
            [BLOCKCHAIN_NAME.BINANCE_SMART_CHAIN]: [stargatePoolId[stargateBridgeToken.USDC]],
            [BLOCKCHAIN_NAME.AVALANCHE]: [stargatePoolId[stargateBridgeToken.USDC]],
            [BLOCKCHAIN_NAME.POLYGON]: [stargatePoolId[stargateBridgeToken.USDC]],
            [BLOCKCHAIN_NAME.ARBITRUM]: [stargatePoolId[stargateBridgeToken.USDC]],
            [BLOCKCHAIN_NAME.OPTIMISM]: [stargatePoolId[stargateBridgeToken.USDC]]
        },
        [stargateBridgeToken.ETH]: {
            [BLOCKCHAIN_NAME.ETHEREUM]: [stargatePoolId[stargateBridgeToken.ETH]],
            [BLOCKCHAIN_NAME.ARBITRUM]: [stargatePoolId[stargateBridgeToken.ETH]],
            [BLOCKCHAIN_NAME.OPTIMISM]: [stargatePoolId[stargateBridgeToken.ETH]]
        }
    }
};
