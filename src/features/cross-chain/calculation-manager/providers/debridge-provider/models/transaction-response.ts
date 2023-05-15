import { Estimation } from 'src/features/cross-chain/calculation-manager/providers/debridge-provider/models/estimation-response';

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
        allowanceTarget: 'string';
        allowanceValue: 'string';
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
