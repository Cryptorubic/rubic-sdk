import { EstimationRequest } from 'src/features/cross-chain/calculation-manager/providers/debridge-provider/models/estimation-request';

/**
 * Transaction request params.
 */
export interface TransactionRequest extends EstimationRequest {
    /**
     * The address target tokens should be transferred to after the swap.
     */
    readonly dstChainTokenOutRecipient: string;

    /**
     * The address target or intermediary tokens should be transferred in case of a failed swap
     * (e.g., a swap may fail due to slippage constraints).
     */
    readonly dstChainFallbackAddress?: string;

    /**
     * Invitation code.
     */
    readonly referralCode?: string;

    /**
     * Tells API server to prepend operating expenses to the input amount.
     */
    readonly prependOperatingExpenses?: boolean;
}
