import { Estimation } from 'src/features/cross-chain/calculation-manager/providers/debridge-provider/models/estimation-response';

export interface DlnTransaction {
    to: string;
    data: string;
    value: string;
    allowanceTarget: string;
    allowanceValue: string;
}

/**
 * Swap transaction response.
 */
export interface TransactionResponse {
    /**
     * Trade estimation response.
     */
    estimation: Estimation;

    /**
     * Tells API server to prepend operating expenses to the input amount.
     */
    prependedOperatingExpenseCost: string;

    /**
     * Transaction data.
     */
    tx: DlnTransaction;
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
