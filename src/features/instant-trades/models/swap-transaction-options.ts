export interface SwapTransactionOptions {
    onConfirm?: (hash: string) => void;
    onApprove?: (hash: string | null) => void;
    gasPrice?: string;
    gasLimit?: string;
}
