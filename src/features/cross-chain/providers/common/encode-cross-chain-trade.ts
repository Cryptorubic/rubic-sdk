import { TransactionConfig } from 'web3-core';
import { Web3Pure } from 'src/core';
import { ContractParams } from '@features/cross-chain/models/contract-params';
import { CrossChainTrade } from '@features/cross-chain/providers/common/cross-chain-trade';
import { EncodeTransactionOptions } from '@features/instant-trades/models/encode-transaction-options';

export abstract class EncodeCrossChainTrade extends CrossChainTrade {
    protected abstract getContractParams(fromAddress?: string): Promise<ContractParams>;

    protected constructor(protected readonly providerAddress: string) {
        super(providerAddress);
    }

    /**
     * Builds transaction config, with encoded data.
     * @param options Encode transaction options.
     */
    public async encode(options: EncodeTransactionOptions): Promise<TransactionConfig> {
        const { gasLimit, gasPrice } = options;

        const { contractAddress, contractAbi, methodName, methodArguments, value } =
            await this.getContractParams(options.fromAddress);

        return Web3Pure.encodeMethodCall(
            contractAddress,
            contractAbi,
            methodName,
            methodArguments,
            value,
            {
                gas: gasLimit || this.gasData?.gasLimit.toFixed(0),
                gasPrice: gasPrice || this.gasData?.gasPrice.toFixed()
            }
        );
    }
}
