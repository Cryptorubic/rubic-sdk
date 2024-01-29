import { Estimation } from 'src/features/cross-chain/calculation-manager/providers/debridge-provider/models/estimation-response';

interface DlnEvmTransaction {
    to: string;
    data: string;
    value: string;
    allowanceTarget: string;
    allowanceValue: string;
}

interface DlnSolanaTransaction {
    data: string;
}

/**
 * Swap transaction response.
 */
export interface TransactionResponse<T> {
    /**
     * Trade estimation response.
     */
    estimation: Estimation;

    /**
     * Tells API server to prepend operating expenses to the input amount.
     */
    prependedOperatingExpenseCost: string;

    /**
     * Provider fee.
     */
    fixFee: string;

    /**
     * Transaction data.
     */
    tx: T;
}

export interface DlnEvmTransactionResponse extends TransactionResponse<DlnEvmTransaction> {}

export interface DlnSolanaTransactionResponse extends TransactionResponse<DlnSolanaTransaction> {}

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
