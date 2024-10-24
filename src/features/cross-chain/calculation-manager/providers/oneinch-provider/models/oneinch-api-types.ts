import { PriceToken, PriceTokenAmount } from 'src/common/tokens';
import { EvmBlockchainName } from 'src/core/blockchain/models/blockchain-name';

export type OneinchResp<T> = T | { description: string; error: string; statusCode: number };
export interface OneinchQuoteParams {
    srcToken: PriceTokenAmount<EvmBlockchainName>;
    dstToken: PriceToken<EvmBlockchainName>;
    walletAddress: string;
}

export interface OneinchSwapOrderParams extends OneinchQuoteParams {
    quote: OneinchCcrQuoteResponse;
    secretHashes: string[];
}

export interface OneinchCcrQuoteResponse {
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
    recommendedPreset: PresetKey;
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

export interface OneinchStatusResponse {
    orderHash: string;
    status: 'pending' | 'executed' | 'expired' | 'cancelled' | 'refunding' | 'refunded';
    fills: Array<{
        status: string;
        txHash: string;
        escrowEvents: Array<{
            transactionHash: string;
            side: 'src' | 'dst';
            action:
                | 'src_escrow_created'
                | 'dst_escrow_created'
                | 'withdrawn'
                | 'funds_rescued'
                | 'escrow_cancelled';
            blockTimestamp: number;
        }>;
    }>;
}

export interface OneinchReadySecretsResponse {
    fills: Array<{
        idx: number;
        srcEscrowDeployTxHash: string;
        dstEscrowDeployTxHash: string;
    }>;
}

export interface OneinchSecret {
    secret: string;
    hashedSecret: string;
}
