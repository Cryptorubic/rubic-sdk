import { PriceToken, PriceTokenAmount } from 'src/common/tokens';
import { EvmBlockchainName } from 'src/core/blockchain/models/blockchain-name';

export interface OneinchQuoteParams {
    srcToken: PriceTokenAmount<EvmBlockchainName>;
    dstToken: PriceToken<EvmBlockchainName>;
    walletAddress: string;
}

export interface OneinchSwapOrderParams extends OneinchQuoteParams {
    quote: OneinchQuoteResponse;
    secretHashes: string[];
}

export interface OneinchQuoteResponse {
    presets: {
        [key in PresetKey]: Preset;
    };
    quoteId: string;
    srcTokenAmount: string;
    /** string wei amount */
    dstTokenAmount: string;
    srcEscrowFactory: string;
    dstEscrowFactory: string;
    srcSafetyDeposit: string;
    dstSafetyDeposit: string;
    whitelist: string[];
    timeLocks: {
        srcWithdrawal: number;
        srcPublicWithdrawal: number;
        srcCancellation: number;
        srcPublicCancellation: number;
        dstWithdrawal: number;
        dstPublicWithdrawal: number;
        dstCancellation: number;
    };
    prices: object;
    volumes: object;
    recommendedPreset: 'fast' | 'slow' | 'medium' | 'custom';
}

type PresetKey = 'fast' | 'slow' | 'medium' | 'custom';

interface Preset {
    allowPartialFills: boolean;
    allowMultipleFills: boolean;
    gasCost: {
        gasBumpEstimate: number;
        gasPriceEstimate: string;
    };
    secretsCount: number;
}

export interface OneinchSwapOrderResponse {
    typedData: {
        primaryType: string;
        domain: OneinchOrderDomain;
        types: object;
        message: OneinchOrderMessage;
    };

    orderHash: string;
    extension: string;
}

interface OneinchOrderMessage {
    maker: string;
    makerAsset: string;
    takerAsset: string;
    makerTraits: string;
    salt: string;
    makingAmount: string;
    takingAmount: string;
    receiver: string;
}

interface OneinchOrderDomain {
    name: string;
    version: string;
    chainId: number;
    verifyingContract: string;
}
