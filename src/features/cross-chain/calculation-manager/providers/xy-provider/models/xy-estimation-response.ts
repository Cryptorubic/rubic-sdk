import { XyStatusCode } from 'src/features/cross-chain/calculation-manager/providers/xy-provider/constants/xy-status-code';

interface BaseToken {
    tokenAddress: string;
    chainId: string;
    symbol: string;
}

interface DexSwap {
    dexNames: string[];
    fromToken: BaseToken;
    toToken: BaseToken;
}

export interface XyEstimationResponse {
    isSuccess: true;
    msg: string;
    statusCode: XyStatusCode;
    destChainId: string;
    fromTokenAddress: string;
    toTokenAddress: string;
    fromTokenAmount: string;
    toTokenAmount: string;
    fromTokenValue: number;
    toTokenValue: number;
    contractAddress: string;
    srcChainId: string;
    crossChainFee: {} | null;
    xyFee: {
        amount: number;
        symbol: string;
    } | null;
    quote: {
        sourceChainSwaps: DexSwap | null;
        crossChainSwap: DexSwap;
        destChainSwaps: DexSwap | null;
        toTokenAmount: string;
    };
}
