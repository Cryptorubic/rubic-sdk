import { Estimation } from 'src/features/cross-chain/providers/debridge-trade-provider/models/estimation-response';

/**
 * Swap transaction response.
 */
export interface TransactionResponse {
    /**
     * Trade estimation response.
     */
    estimation: Estimation;

    /**
     * Transaction data.
     */
    tx: {
        to: string;
        data: string;
        value: string;
    };
}

/**
 * Swap transaction error response.
 */
export interface TransactionErrorResponse {
    /**
     * Error code.
     */
    errorCode: number;

    /**
     * Error ID.
     */
    errorId: string;

    /**
     * Error message.
     */
    errorMessage: string;
}
