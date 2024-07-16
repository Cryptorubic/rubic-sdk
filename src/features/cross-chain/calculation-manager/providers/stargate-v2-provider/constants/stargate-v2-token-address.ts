import { BLOCKCHAIN_NAME } from 'src/core/blockchain/models/blockchain-name';

import { StargateV2BridgeToken, stargateV2BridgeToken } from './stargate-v2-bridge-token';
import { StargateV2SupportedBlockchains } from './stargate-v2-cross-chain-supported-blockchains';

type StargateV2TokenAddress = Record<
    StargateV2SupportedBlockchains,
    Partial<Record<string, StargateV2BridgeToken>>
>;

export const stargateV2TokenAddress: StargateV2TokenAddress = {
    [BLOCKCHAIN_NAME.ETHEREUM]: {
        '0x0000000000000000000000000000000000000000': stargateV2BridgeToken.ETH,
        '0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48': stargateV2BridgeToken.USDC,
        '0xdac17f958d2ee523a2206206994597c13d831ec7': stargateV2BridgeToken.USDT,
        '0x9e32b13ce7f2e80a01932b42553652e053d6ed8e': stargateV2BridgeToken.METIS,
        '0xd5f7838f5c461feff7fe49ea5ebaf7728bb0adfa': stargateV2BridgeToken.METH
    },
    [BLOCKCHAIN_NAME.BINANCE_SMART_CHAIN]: {
        '0x55d398326f99059fF775485246999027B3197955': stargateV2BridgeToken.USDT
    },
    [BLOCKCHAIN_NAME.AVALANCHE]: {
        '0xb97ef9ef8734c71904d8002f8b6bc66dd9c48a6e': stargateV2BridgeToken.USDC,
        '0x9702230a8ea53601f5cd2dc00fdbc13d4df4a8c7': stargateV2BridgeToken.USDT
    },
    [BLOCKCHAIN_NAME.POLYGON]: {
        '0x3c499c542cef5e3811e1192ce70d8cc03d5c3359': stargateV2BridgeToken.USDC,
        '0xc2132d05d31c914a87c6611c10748aeb04b58e8f': stargateV2BridgeToken.USDT
    },
    [BLOCKCHAIN_NAME.ARBITRUM]: {
        '0x0000000000000000000000000000000000000000': stargateV2BridgeToken.ETH,
        '0xaf88d065e77c8cc2239327c5edb3a432268e5831': stargateV2BridgeToken.USDC,
        '0xfd086bc7cd5c481dcc9c85ebe478a1c0b69fcbb9': stargateV2BridgeToken.USDT
    },
    [BLOCKCHAIN_NAME.OPTIMISM]: {
        '0x0000000000000000000000000000000000000000': stargateV2BridgeToken.ETH,
        '0x0b2c639c533813f4aa9d7837caf62653d097ff85': stargateV2BridgeToken.USDC,
        '0x94b008aa00579c1307b0ef2c499ad98a8ce58e58': stargateV2BridgeToken.USDT
    },
    [BLOCKCHAIN_NAME.METIS]: {
        '0xbb06dca3ae6887fabf931640f67cab3e3a16f4dc': stargateV2BridgeToken.mUSD,
        '0x420000000000000000000000000000000000000a': stargateV2BridgeToken.WETH,
        '0x0000000000000000000000000000000000000000': stargateV2BridgeToken.METIS
    },
    [BLOCKCHAIN_NAME.LINEA]: {
        '0x0000000000000000000000000000000000000000': stargateV2BridgeToken.ETH
    },
    [BLOCKCHAIN_NAME.MANTLE]: {
        '0x09bc4e0d864854c6afb6eb9a9cdf58ac190d0df9': stargateV2BridgeToken.USDC,
        '0x201eba5cc46d216ce6dc03f6a759e8e766e956ae': stargateV2BridgeToken.USDT,
        '0xdeaddeaddeaddeaddeaddeaddeaddeaddead1111': stargateV2BridgeToken.WETH,
        '0xcda86a272531e8640cd7f1a92c01839911b90bb0': stargateV2BridgeToken.METH
    },
    [BLOCKCHAIN_NAME.BASE]: {
        '0x0000000000000000000000000000000000000000': stargateV2BridgeToken.ETH,
        '0x833589fcd6edb6e08f4c7c32d4f71b54bda02913': stargateV2BridgeToken.USDC
    },
    [BLOCKCHAIN_NAME.KAVA]: {
        '0x919c1c267bc06a7039e03fcc2ef738525769109c': stargateV2BridgeToken.USDT
    },
    [BLOCKCHAIN_NAME.SCROLL]: {
        '0x0000000000000000000000000000000000000000': stargateV2BridgeToken.ETH,
        '0x06efdbff2a14a7c8e15944d1f4a48f9f95f663a4': stargateV2BridgeToken.USDCe
    },
    [BLOCKCHAIN_NAME.AURORA]: {
        '0xb12bfca5a55806aaf64e99521918a4bf0fc40802': stargateV2BridgeToken.USDC
    }
};

