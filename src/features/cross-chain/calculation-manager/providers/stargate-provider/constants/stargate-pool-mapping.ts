import { BLOCKCHAIN_NAME } from 'src/core/blockchain/models/blockchain-name';
import {
    StargateBridgeToken,
    stargateBridgeToken
} from 'src/features/cross-chain/calculation-manager/providers/stargate-provider/constants/stargate-bridge-token';
import { StargateCrossChainSupportedBlockchain } from 'src/features/cross-chain/calculation-manager/providers/stargate-provider/constants/stargate-cross-chain-supported-blockchain';

type StargatePoolMapping = Record<
    StargateCrossChainSupportedBlockchain,
    Partial<
        Record<
            StargateBridgeToken,
            Partial<Record<StargateCrossChainSupportedBlockchain, StargateBridgeToken[]>>
        >
    >
>;

export const stargatePoolMapping: StargatePoolMapping = {
    [BLOCKCHAIN_NAME.ETHEREUM]: {
        [stargateBridgeToken.USDC]: {
            [BLOCKCHAIN_NAME.BINANCE_SMART_CHAIN]: [
                stargateBridgeToken.USDT,
                stargateBridgeToken.BUSD
            ],
            [BLOCKCHAIN_NAME.POLYGON]: [stargateBridgeToken.USDT, stargateBridgeToken.USDC],
            [BLOCKCHAIN_NAME.AVALANCHE]: [stargateBridgeToken.USDT, stargateBridgeToken.USDC],
            [BLOCKCHAIN_NAME.FANTOM]: [stargateBridgeToken.USDC],
            [BLOCKCHAIN_NAME.ARBITRUM]: [stargateBridgeToken.USDT, stargateBridgeToken.USDC],
            [BLOCKCHAIN_NAME.OPTIMISM]: [stargateBridgeToken.USDC]
        },
        [stargateBridgeToken.USDT]: {
            [BLOCKCHAIN_NAME.BINANCE_SMART_CHAIN]: [
                stargateBridgeToken.BUSD,
                stargateBridgeToken.USDT
            ],
            [BLOCKCHAIN_NAME.AVALANCHE]: [stargateBridgeToken.USDT, stargateBridgeToken.USDC],
            [BLOCKCHAIN_NAME.POLYGON]: [stargateBridgeToken.USDT, stargateBridgeToken.USDC],
            [BLOCKCHAIN_NAME.ARBITRUM]: [stargateBridgeToken.USDT, stargateBridgeToken.USDC],
            [BLOCKCHAIN_NAME.OPTIMISM]: [stargateBridgeToken.USDC],
            [BLOCKCHAIN_NAME.FANTOM]: [stargateBridgeToken.USDC],
            [BLOCKCHAIN_NAME.METIS]: [stargateBridgeToken.USDT]
        },
        [stargateBridgeToken.DAI]: {
            [BLOCKCHAIN_NAME.POLYGON]: [stargateBridgeToken.DAI],
            [BLOCKCHAIN_NAME.OPTIMISM]: [stargateBridgeToken.DAI]
        },
        [stargateBridgeToken.MAI]: {
            [BLOCKCHAIN_NAME.BINANCE_SMART_CHAIN]: [stargateBridgeToken.MAI],
            [BLOCKCHAIN_NAME.AVALANCHE]: [stargateBridgeToken.MAI],
            [BLOCKCHAIN_NAME.POLYGON]: [stargateBridgeToken.MAI],
            [BLOCKCHAIN_NAME.ARBITRUM]: [stargateBridgeToken.MAI],
            [BLOCKCHAIN_NAME.OPTIMISM]: [stargateBridgeToken.MAI]
        },
        [stargateBridgeToken.FRAX]: {
            [BLOCKCHAIN_NAME.AVALANCHE]: [stargateBridgeToken.FRAX],
            [BLOCKCHAIN_NAME.ARBITRUM]: [stargateBridgeToken.FRAX],
            [BLOCKCHAIN_NAME.OPTIMISM]: [stargateBridgeToken.FRAX]
        },
        [stargateBridgeToken.USDD]: {
            [BLOCKCHAIN_NAME.BINANCE_SMART_CHAIN]: [stargateBridgeToken.USDD]
        },
        [stargateBridgeToken.ETH]: {
            [BLOCKCHAIN_NAME.ARBITRUM]: [stargateBridgeToken.ETH],
            [BLOCKCHAIN_NAME.OPTIMISM]: [stargateBridgeToken.ETH]
        },
        [stargateBridgeToken.sUSD]: {
            [BLOCKCHAIN_NAME.OPTIMISM]: [stargateBridgeToken.sUSD]
        },
        [stargateBridgeToken.LUSD]: {
            [BLOCKCHAIN_NAME.ARBITRUM]: [stargateBridgeToken.LUSD],
            [BLOCKCHAIN_NAME.OPTIMISM]: [stargateBridgeToken.LUSD]
        },
        [stargateBridgeToken.METIS]: {
            [BLOCKCHAIN_NAME.BINANCE_SMART_CHAIN]: [stargateBridgeToken.METIS],
            [BLOCKCHAIN_NAME.METIS]: [stargateBridgeToken.METIS]
        }
    },
    [BLOCKCHAIN_NAME.BINANCE_SMART_CHAIN]: {
        [stargateBridgeToken.USDT]: {
            [BLOCKCHAIN_NAME.ETHEREUM]: [stargateBridgeToken.BUSD, stargateBridgeToken.USDT],
            [BLOCKCHAIN_NAME.AVALANCHE]: [stargateBridgeToken.USDT, stargateBridgeToken.USDC],
            [BLOCKCHAIN_NAME.POLYGON]: [stargateBridgeToken.USDT, stargateBridgeToken.USDC],
            [BLOCKCHAIN_NAME.ARBITRUM]: [stargateBridgeToken.USDT, stargateBridgeToken.USDC],
            [BLOCKCHAIN_NAME.OPTIMISM]: [stargateBridgeToken.USDC],
            [BLOCKCHAIN_NAME.FANTOM]: [stargateBridgeToken.USDC],
            [BLOCKCHAIN_NAME.METIS]: [stargateBridgeToken.mUSD]
        },
        [stargateBridgeToken.BUSD]: {
            [BLOCKCHAIN_NAME.ETHEREUM]: [stargateBridgeToken.USDT, stargateBridgeToken.USDC],
            [BLOCKCHAIN_NAME.AVALANCHE]: [stargateBridgeToken.USDT, stargateBridgeToken.USDC],
            [BLOCKCHAIN_NAME.POLYGON]: [stargateBridgeToken.USDT, stargateBridgeToken.USDC],
            [BLOCKCHAIN_NAME.ARBITRUM]: [stargateBridgeToken.USDT, stargateBridgeToken.USDC],
            [BLOCKCHAIN_NAME.OPTIMISM]: [stargateBridgeToken.USDC],
            [BLOCKCHAIN_NAME.FANTOM]: [stargateBridgeToken.USDC]
        },
        [stargateBridgeToken.USDD]: {
            [BLOCKCHAIN_NAME.ETHEREUM]: [stargateBridgeToken.USDD]
        },
        [stargateBridgeToken.MAI]: {
            [BLOCKCHAIN_NAME.ETHEREUM]: [stargateBridgeToken.MAI],
            [BLOCKCHAIN_NAME.AVALANCHE]: [stargateBridgeToken.MAI],
            [BLOCKCHAIN_NAME.POLYGON]: [stargateBridgeToken.MAI],
            [BLOCKCHAIN_NAME.ARBITRUM]: [stargateBridgeToken.MAI],
            [BLOCKCHAIN_NAME.OPTIMISM]: [stargateBridgeToken.MAI]
        },
        [stargateBridgeToken.METIS]: {
            [BLOCKCHAIN_NAME.ETHEREUM]: [stargateBridgeToken.METIS],
            [BLOCKCHAIN_NAME.METIS]: [stargateBridgeToken.METIS]
        }
    },
    [BLOCKCHAIN_NAME.POLYGON]: {
        [stargateBridgeToken.USDC]: {
            [BLOCKCHAIN_NAME.ETHEREUM]: [stargateBridgeToken.USDT, stargateBridgeToken.USDC],
            [BLOCKCHAIN_NAME.BINANCE_SMART_CHAIN]: [
                stargateBridgeToken.BUSD,
                stargateBridgeToken.USDT
            ],
            [BLOCKCHAIN_NAME.AVALANCHE]: [stargateBridgeToken.USDT, stargateBridgeToken.USDC],
            [BLOCKCHAIN_NAME.FANTOM]: [stargateBridgeToken.USDC],
            [BLOCKCHAIN_NAME.ARBITRUM]: [stargateBridgeToken.USDT, stargateBridgeToken.USDC],
            [BLOCKCHAIN_NAME.OPTIMISM]: [stargateBridgeToken.USDC]
        },
        [stargateBridgeToken.USDT]: {
            [BLOCKCHAIN_NAME.BINANCE_SMART_CHAIN]: [
                stargateBridgeToken.BUSD,
                stargateBridgeToken.USDT
            ],
            [BLOCKCHAIN_NAME.AVALANCHE]: [stargateBridgeToken.USDT, stargateBridgeToken.USDC],
            [BLOCKCHAIN_NAME.ETHEREUM]: [stargateBridgeToken.USDT, stargateBridgeToken.USDC],
            [BLOCKCHAIN_NAME.ARBITRUM]: [stargateBridgeToken.USDT, stargateBridgeToken.USDC],
            [BLOCKCHAIN_NAME.OPTIMISM]: [stargateBridgeToken.USDC],
            [BLOCKCHAIN_NAME.FANTOM]: [stargateBridgeToken.USDC],
            [BLOCKCHAIN_NAME.METIS]: [stargateBridgeToken.mUSD]
        },
        [stargateBridgeToken.DAI]: {
            [BLOCKCHAIN_NAME.ETHEREUM]: [stargateBridgeToken.DAI],
            [BLOCKCHAIN_NAME.OPTIMISM]: [stargateBridgeToken.DAI]
        },
        [stargateBridgeToken.MAI]: {
            [BLOCKCHAIN_NAME.BINANCE_SMART_CHAIN]: [stargateBridgeToken.MAI],
            [BLOCKCHAIN_NAME.AVALANCHE]: [stargateBridgeToken.MAI],
            [BLOCKCHAIN_NAME.ETHEREUM]: [stargateBridgeToken.MAI],
            [BLOCKCHAIN_NAME.ARBITRUM]: [stargateBridgeToken.MAI],
            [BLOCKCHAIN_NAME.OPTIMISM]: [stargateBridgeToken.MAI]
        }
    },
    [BLOCKCHAIN_NAME.AVALANCHE]: {
        [stargateBridgeToken.USDC]: {
            [BLOCKCHAIN_NAME.BINANCE_SMART_CHAIN]: [
                stargateBridgeToken.BUSD,
                stargateBridgeToken.USDT
            ],
            [BLOCKCHAIN_NAME.POLYGON]: [stargateBridgeToken.USDT, stargateBridgeToken.USDC],
            [BLOCKCHAIN_NAME.ETHEREUM]: [stargateBridgeToken.USDT, stargateBridgeToken.USDC],
            [BLOCKCHAIN_NAME.FANTOM]: [stargateBridgeToken.USDC],
            [BLOCKCHAIN_NAME.ARBITRUM]: [stargateBridgeToken.USDT, stargateBridgeToken.USDC],
            [BLOCKCHAIN_NAME.OPTIMISM]: [stargateBridgeToken.USDC]
        },
        [stargateBridgeToken.USDT]: {
            [BLOCKCHAIN_NAME.BINANCE_SMART_CHAIN]: [
                stargateBridgeToken.BUSD,
                stargateBridgeToken.USDT
            ],
            [BLOCKCHAIN_NAME.ETHEREUM]: [stargateBridgeToken.USDT, stargateBridgeToken.USDC],
            [BLOCKCHAIN_NAME.POLYGON]: [stargateBridgeToken.USDT, stargateBridgeToken.USDC],
            [BLOCKCHAIN_NAME.ARBITRUM]: [stargateBridgeToken.USDT, stargateBridgeToken.USDC],
            [BLOCKCHAIN_NAME.OPTIMISM]: [stargateBridgeToken.USDC],
            [BLOCKCHAIN_NAME.FANTOM]: [stargateBridgeToken.USDC],
            [BLOCKCHAIN_NAME.METIS]: [stargateBridgeToken.mUSD]
        },
        [stargateBridgeToken.MAI]: {
            [BLOCKCHAIN_NAME.BINANCE_SMART_CHAIN]: [stargateBridgeToken.MAI],
            [BLOCKCHAIN_NAME.ETHEREUM]: [stargateBridgeToken.MAI],
            [BLOCKCHAIN_NAME.POLYGON]: [stargateBridgeToken.MAI],
            [BLOCKCHAIN_NAME.ARBITRUM]: [stargateBridgeToken.MAI],
            [BLOCKCHAIN_NAME.OPTIMISM]: [stargateBridgeToken.MAI]
        }
    },
    [BLOCKCHAIN_NAME.FANTOM]: {
        [stargateBridgeToken.USDC]: {
            [BLOCKCHAIN_NAME.BINANCE_SMART_CHAIN]: [
                stargateBridgeToken.BUSD,
                stargateBridgeToken.USDT
            ],
            [BLOCKCHAIN_NAME.POLYGON]: [stargateBridgeToken.USDT, stargateBridgeToken.USDC],
            [BLOCKCHAIN_NAME.ETHEREUM]: [stargateBridgeToken.USDT, stargateBridgeToken.USDC],
            [BLOCKCHAIN_NAME.AVALANCHE]: [stargateBridgeToken.USDC, stargateBridgeToken.USDT],
            [BLOCKCHAIN_NAME.ARBITRUM]: [stargateBridgeToken.USDT, stargateBridgeToken.USDC],
            [BLOCKCHAIN_NAME.OPTIMISM]: [stargateBridgeToken.USDC]
        }
    },
    [BLOCKCHAIN_NAME.ARBITRUM]: {
        [stargateBridgeToken.USDC]: {
            [BLOCKCHAIN_NAME.ETHEREUM]: [stargateBridgeToken.USDT, stargateBridgeToken.USDC],
            [BLOCKCHAIN_NAME.BINANCE_SMART_CHAIN]: [
                stargateBridgeToken.USDT,
                stargateBridgeToken.BUSD
            ],
            [BLOCKCHAIN_NAME.POLYGON]: [stargateBridgeToken.USDT, stargateBridgeToken.USDC],
            [BLOCKCHAIN_NAME.AVALANCHE]: [stargateBridgeToken.USDT, stargateBridgeToken.USDC],
            [BLOCKCHAIN_NAME.OPTIMISM]: [stargateBridgeToken.USDC],
            [BLOCKCHAIN_NAME.FANTOM]: [stargateBridgeToken.USDC]
        },
        [stargateBridgeToken.USDT]: {
            [BLOCKCHAIN_NAME.BINANCE_SMART_CHAIN]: [
                stargateBridgeToken.BUSD,
                stargateBridgeToken.USDT
            ],
            [BLOCKCHAIN_NAME.ETHEREUM]: [stargateBridgeToken.USDT, stargateBridgeToken.USDC],
            [BLOCKCHAIN_NAME.POLYGON]: [stargateBridgeToken.USDT, stargateBridgeToken.USDC],
            [BLOCKCHAIN_NAME.AVALANCHE]: [stargateBridgeToken.USDT, stargateBridgeToken.USDC],
            [BLOCKCHAIN_NAME.OPTIMISM]: [stargateBridgeToken.USDC],
            [BLOCKCHAIN_NAME.FANTOM]: [stargateBridgeToken.USDC],
            [BLOCKCHAIN_NAME.METIS]: [stargateBridgeToken.mUSD]
        },
        [stargateBridgeToken.ETH]: {
            [BLOCKCHAIN_NAME.ETHEREUM]: [stargateBridgeToken.ETH],
            [BLOCKCHAIN_NAME.OPTIMISM]: [stargateBridgeToken.ETH]
        },
        [stargateBridgeToken.FRAX]: {
            [BLOCKCHAIN_NAME.AVALANCHE]: [stargateBridgeToken.FRAX],
            [BLOCKCHAIN_NAME.ETHEREUM]: [stargateBridgeToken.FRAX],
            [BLOCKCHAIN_NAME.OPTIMISM]: [stargateBridgeToken.FRAX]
        },
        [stargateBridgeToken.MAI]: {
            [BLOCKCHAIN_NAME.BINANCE_SMART_CHAIN]: [stargateBridgeToken.MAI],
            [BLOCKCHAIN_NAME.AVALANCHE]: [stargateBridgeToken.MAI],
            [BLOCKCHAIN_NAME.POLYGON]: [stargateBridgeToken.MAI],
            [BLOCKCHAIN_NAME.ETHEREUM]: [stargateBridgeToken.MAI],
            [BLOCKCHAIN_NAME.OPTIMISM]: [stargateBridgeToken.MAI]
        },
        [stargateBridgeToken.LUSD]: {
            [BLOCKCHAIN_NAME.ETHEREUM]: [stargateBridgeToken.LUSD],
            [BLOCKCHAIN_NAME.OPTIMISM]: [stargateBridgeToken.LUSD]
        }
    },
    [BLOCKCHAIN_NAME.OPTIMISM]: {
        [stargateBridgeToken.USDC]: {
            [BLOCKCHAIN_NAME.ETHEREUM]: [stargateBridgeToken.USDT, stargateBridgeToken.USDC],
            [BLOCKCHAIN_NAME.BINANCE_SMART_CHAIN]: [
                stargateBridgeToken.USDT,
                stargateBridgeToken.BUSD
            ],
            [BLOCKCHAIN_NAME.POLYGON]: [stargateBridgeToken.USDT, stargateBridgeToken.USDC],
            [BLOCKCHAIN_NAME.AVALANCHE]: [stargateBridgeToken.USDT, stargateBridgeToken.USDC],
            [BLOCKCHAIN_NAME.ARBITRUM]: [stargateBridgeToken.USDC],
            [BLOCKCHAIN_NAME.FANTOM]: [stargateBridgeToken.USDC]
        },
        [stargateBridgeToken.USDT]: {
            [BLOCKCHAIN_NAME.BINANCE_SMART_CHAIN]: [
                stargateBridgeToken.BUSD,
                stargateBridgeToken.USDT
            ],
            [BLOCKCHAIN_NAME.ETHEREUM]: [stargateBridgeToken.USDT, stargateBridgeToken.USDC],
            [BLOCKCHAIN_NAME.POLYGON]: [stargateBridgeToken.USDT, stargateBridgeToken.USDC],
            [BLOCKCHAIN_NAME.AVALANCHE]: [stargateBridgeToken.USDT, stargateBridgeToken.USDC],
            [BLOCKCHAIN_NAME.ARBITRUM]: [stargateBridgeToken.USDC],
            [BLOCKCHAIN_NAME.FANTOM]: [stargateBridgeToken.USDC],
            [BLOCKCHAIN_NAME.METIS]: [stargateBridgeToken.mUSD]
        },
        [stargateBridgeToken.FRAX]: {
            [BLOCKCHAIN_NAME.AVALANCHE]: [stargateBridgeToken.FRAX],
            [BLOCKCHAIN_NAME.ETHEREUM]: [stargateBridgeToken.FRAX],
            [BLOCKCHAIN_NAME.ARBITRUM]: [stargateBridgeToken.FRAX]
        },
        [stargateBridgeToken.MAI]: {
            [BLOCKCHAIN_NAME.BINANCE_SMART_CHAIN]: [stargateBridgeToken.MAI],
            [BLOCKCHAIN_NAME.AVALANCHE]: [stargateBridgeToken.MAI],
            [BLOCKCHAIN_NAME.POLYGON]: [stargateBridgeToken.MAI],
            [BLOCKCHAIN_NAME.ETHEREUM]: [stargateBridgeToken.MAI],
            [BLOCKCHAIN_NAME.ARBITRUM]: [stargateBridgeToken.MAI]
        },
        [stargateBridgeToken.LUSD]: {
            [BLOCKCHAIN_NAME.ETHEREUM]: [stargateBridgeToken.LUSD],
            [BLOCKCHAIN_NAME.ARBITRUM]: [stargateBridgeToken.LUSD]
        },
        [stargateBridgeToken.DAI]: {
            [BLOCKCHAIN_NAME.ETHEREUM]: [stargateBridgeToken.DAI],
            [BLOCKCHAIN_NAME.POLYGON]: [stargateBridgeToken.DAI]
        },
        [stargateBridgeToken.sUSD]: {
            [BLOCKCHAIN_NAME.ETHEREUM]: [stargateBridgeToken.sUSD]
        },
        [stargateBridgeToken.ETH]: {
            [BLOCKCHAIN_NAME.ETHEREUM]: [stargateBridgeToken.ETH]
        }
    },
    [BLOCKCHAIN_NAME.METIS]: {
        [stargateBridgeToken.METIS]: {
            [BLOCKCHAIN_NAME.ETHEREUM]: [stargateBridgeToken.METIS],
            [BLOCKCHAIN_NAME.BINANCE_SMART_CHAIN]: [stargateBridgeToken.METIS]
        },
        [stargateBridgeToken.mUSD]: {
            [BLOCKCHAIN_NAME.ETHEREUM]: [stargateBridgeToken.USDT],
            [BLOCKCHAIN_NAME.BINANCE_SMART_CHAIN]: [stargateBridgeToken.USDT],
            [BLOCKCHAIN_NAME.AVALANCHE]: [stargateBridgeToken.USDT]
        }
    }
};
