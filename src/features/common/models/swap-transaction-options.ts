import {
    EIP1559Gas,
    SingleGasPrice
} from 'src/core/blockchain/web3-public-service/web3-public/evm-web3-public/models/gas-price';

export interface SwapTransactionOptions {
    /**
     * Callback to be called, when user confirm swap transaction.
     * @param hash Transaction hash.
     */
    onConfirm?: (hash: string) => void;

    /**
     * Callback to be called, when user confirm approve transaction.
     * @param hash Transaction hash.
     */
    onApprove?: (hash: string | null) => void;

    /**
     * Tokens receiver address.
     */
    receiverAddress?: string;

    // gasPriceOptions: SingleGasPrice | EIP1559Gas

    /**
     * @deprecated Use gasPriceOptions instead.
     * Evm-Transaction gas price.
     */
    gasPrice?: string;

    /**
     * Transaction gas price options.
     */
    gasPriceOptions?: EIP1559Gas | SingleGasPrice;

    /**
     * Evm-transaction gas limit.
     */
    gasLimit?: string;

    /**
     * Approve evm-transaction gas limit.
     * Will be used for approve transaction, if it is called before swap.
     */
    approveGasLimit?: string;

    /**
     * Tron-transaction fee limit.
     */
    feeLimit?: number;

    /**
     * Approve tron-transaction fee limit.
     * Will be used for approve transaction, if it is called before swap.
     */
    approveFeeLimit?: number;

    testMode?: boolean;
}
