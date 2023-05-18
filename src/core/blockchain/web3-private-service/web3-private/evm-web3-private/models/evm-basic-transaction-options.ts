import BigNumber from 'bignumber.js';
import { BasicTransactionOptions } from 'src/core/blockchain/web3-private-service/web3-private/models/basic-transaction-options';

export interface EvmBasicTransactionOptions extends BasicTransactionOptions {
    /**
     * Transaction gas limit.
     */
    gas?: BigNumber | string | number;

    /**
     * Transaction gas price.
     */
    gasPrice?: BigNumber | string | number;

    /**
     * EIP-1559 Transaction miner's tip.
     */
    maxPriorityFeePerGas?: number | string;

    /**
     * EIP-1559 Transaction maximum fee.
     */
    maxFeePerGas?: number | string;
}
