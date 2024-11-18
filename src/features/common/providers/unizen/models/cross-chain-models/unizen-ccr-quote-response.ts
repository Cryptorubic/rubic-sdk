import {
    UniZenCcrTradeDex,
    UniZenCcrTradeProvider
} from 'src/features/cross-chain/calculation-manager/providers/unizen-provider/constants/unizen-trade-providers';

export interface UniZenCcrQuoteResponse {
    srcTradeList: unknown[];
    dstTradeList: unknown[];
    dstTrade: UniZenTradeInfo;
    srcTrade: UniZenTradeInfo;
    fee: string;
    nativeFee: string;
    nativeValue: string;
    priceImpact: number;
    providerInfo: { name: string };
    sourceChainId: number;
    destinationChainId: number;
    contractVersion: 'V1' | 'V2';
    toTokenAmountWithoutFee: string;
    tradeProtocol: UniZenCcrTradeProvider;
    transactionData: UniZenTxData;
    uuid: string;
}

export interface UniZenTradeInfo {
    deltaAmount: string;
    fromTokenAmount: string;
    protocol: {
        logo: string;
        name: UniZenCcrTradeDex;
        route: string[];
    }[];
    toTokenAmount: string;
    tokenFrom: UniZenToken;
    tokenTo: UniZenToken;
    transactionData: Object;
}

interface UniZenToken {
    chainId: number;
    contractAddress: string;
    symbol: string;
}

interface UniZenTxData {
    dstCalls: UniZenCallsData[];
    srcCalls: UniZenCallsData[];
    nativeFee: string;
    params: {
        actualQuote: string;
        amount: string;
        apiId: string;
        dstChain: number;
        dstPool: number;
        dstToken: string;
        fee: string;
        gasDstChain: number;
        isFromNative: boolean;
        minQuote: string;
        nativeFee: string;
        receiver: string;
        requestId: string;
        srcPool: number;
        srcToken: string;
        tradeType: string;
        userPSFee: number;
        uuid: string;
        uuidPercentage: string;
    };
}

interface UniZenCallsData {
    amount: string;
    buyToken: string;
    data: string;
    sellToken: string;
    targetExchange: string;
    targetExchangeID: string;
    tradeProtocol: string;
}
