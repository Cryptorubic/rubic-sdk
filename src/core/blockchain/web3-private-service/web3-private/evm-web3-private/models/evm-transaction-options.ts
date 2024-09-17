import BigNumber from 'bignumber.js';
import { EvmBasicTransactionOptions } from 'src/core/blockchain/web3-private-service/web3-private/evm-web3-private/models/evm-basic-transaction-options';

export interface EvmTransactionOptions extends EvmBasicTransactionOptions {
    /**
     * Encoded data, which will be executed in transaction.
     */
    data?: string;

    /**
     * Native token amount in wei.
     */
    value?: BigNumber | string;

    /**
     * Use in case of eip-155
     */
    chainId?: string;

    /**
     * gasLimit multiplier (to change ratio for specific chain)
     */
    gasLimitRatio?: number;

    /**
     * Address send transaction to
     */
    to?: string;
}
