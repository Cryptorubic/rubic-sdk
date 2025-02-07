import { BLOCKCHAIN_NAME } from 'src/core/blockchain/models/blockchain-name';

import { StargateV2BridgeToken, stargateV2BridgeToken } from './stargate-v2-bridge-token';
import { StargateV2SupportedBlockchains } from './stargate-v2-cross-chain-supported-blockchains';

type StargateV2TokenAddress = Record<
    StargateV2SupportedBlockchains,
    Partial<Record<string, StargateV2BridgeToken>>
>;

const addresses: StargateV2TokenAddress = {
    [BLOCKCHAIN_NAME.ETHEREUM]: {
        '0x0000000000000000000000000000000000000000': stargateV2BridgeToken.ETH,
        '0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48': stargateV2BridgeToken.USDC,
        '0xdac17f958d2ee523a2206206994597c13d831ec7': stargateV2BridgeToken.USDT,
        '0x9e32b13ce7f2e80a01932b42553652e053d6ed8e': stargateV2BridgeToken.METIS,
        '0xd5f7838f5c461feff7fe49ea5ebaf7728bb0adfa': stargateV2BridgeToken.METH
    },
    [BLOCKCHAIN_NAME.BINANCE_SMART_CHAIN]: {
        '0x55d398326f99059fF775485246999027B3197955': stargateV2BridgeToken.USDT,
        '0x8ac76a51cc950d9822d68b83fe1ad97b32cd580d': stargateV2BridgeToken.USDC
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
        '0x368ebb46aca6b8d0787c96b2b20bd3cc3f2c45f7': stargateV2BridgeToken.USDC
    },
    // [BLOCKCHAIN_NAME.KLAYTN]: {
    //     '0xe2053bcf56d2030d2470fb454574237cf9ee3d4b': stargateV2BridgeToken.USDC,
    //     '0x9025095263d1e548dc890a7589a4c78038ac40ab': stargateV2BridgeToken.USDT,
    //     '0x55acee547df909cf844e32dd66ee55a6f81dc71b': stargateV2BridgeToken.WETH
    // },
    [BLOCKCHAIN_NAME.TAIKO]: {
        '0x19e26B0638bf63aa9fa4d14c6baF8D52eBE86C5C': stargateV2BridgeToken.USDC,
        '0x9c2dc7377717603eB92b2655c5f2E7997a4945BD': stargateV2BridgeToken.USDT
    },
    [BLOCKCHAIN_NAME.SEI]: {
        '0x160345fC359604fC6e70E3c5fAcbdE5F7A9342d8': stargateV2BridgeToken.WETH
    },
    [BLOCKCHAIN_NAME.FLARE]: {
        '0xFbDa5F676cB37624f28265A144A48B0d6e87d3b6': stargateV2BridgeToken.USDC,
        '0x0B38e83B86d491735fEaa0a791F65c2B99535396': stargateV2BridgeToken.USDT,
        '0x1502FA4be69d526124D453619276FacCab275d3D': stargateV2BridgeToken.WETH
    },
    [BLOCKCHAIN_NAME.GRAVITY]: {
        '0xf6f832466Cd6C21967E0D954109403f36Bc8ceaA': stargateV2BridgeToken.WETH,
        '0xFbDa5F676cB37624f28265A144A48B0d6e87d3b6': stargateV2BridgeToken.USDC,
        '0x816E810f9F787d669FB71932DeabF6c83781Cd48': stargateV2BridgeToken.USDT
    },
    [BLOCKCHAIN_NAME.BERACHAIN]: {
        '0x549943e04f40284185054145c6E4e9568C1D3241': stargateV2BridgeToken.USDC,
        '0x2F6F07CDcf3588944Bf4C42aC74ff24bF56e7590': stargateV2BridgeToken.WETH
    }
};

export const stargateV2TokenAddress = Object.entries(addresses).reduce(
    (acc, [chainName, tokens]) => {
        const supportedChain = chainName as StargateV2SupportedBlockchains;
        acc[supportedChain] = {} as Partial<Record<string, StargateV2BridgeToken>>;
        for (const tokenAddress in tokens) {
            const stargateTokenSymbol = tokens[tokenAddress];
            const addressToLower = tokenAddress.toLowerCase();
            acc[supportedChain][addressToLower] = stargateTokenSymbol;
        }

        return acc;
    },
    {} as StargateV2TokenAddress
);
