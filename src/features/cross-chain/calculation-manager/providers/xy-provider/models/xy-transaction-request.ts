import { XyEstimationRequest } from 'src/features/cross-chain/calculation-manager/providers/xy-provider/models/xy-estimation-request';

/**
 * Transaction request params.
 */
export interface XyTransactionRequest extends XyEstimationRequest {
    /**
     * Tokens receiver address.
     */
    readonly receiveAddress: string;

    /**
     * Swap slippage tolerance.
     */
    readonly slippage: string;

    /**
     * Ref address to support stuck transactions.
     */
    readonly referrer: string;
}
