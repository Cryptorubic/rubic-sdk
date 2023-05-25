import {
    EIP1559Gas,
    SingleGasPrice
} from 'src/core/blockchain/web3-public-service/web3-public/evm-web3-public/models/gas-price';

/**
 * Stores options for transaction in `encode` function.
 */
export interface EncodeTransactionOptions {
    /**
     * User wallet address to send swap transaction.
     */
    fromAddress: string;

    receiverAddress?: string;

    /**
     * @deprecated Use gasPriceOptions instead.
     * Evm-transaction gas price.
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
     * Uniquely for Uniswap v2, defines which method to use - regular or supporting fee.
     */
    supportFee?: boolean;

    /**
     * Tron-transaction fee limit.
     */
    feeLimit?: number;
}
