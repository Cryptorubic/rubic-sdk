import { TransactionReceipt } from 'web3-eth';
import BigNumber from 'bignumber.js';
import { Web3Public } from 'src/core';
import { Chain } from '__tests__/utils/chain';

export class Utils {
    constructor(private readonly chain: Chain, private readonly web3Public: Web3Public) {}

    async getTransactionFeeByReceipt(transactionReceipt: TransactionReceipt): Promise<BigNumber> {
        const transaction = (await this.web3Public.getTransactionByHash(
            transactionReceipt.transactionHash
        ))!;
        return new BigNumber(transactionReceipt.gasUsed).multipliedBy(transaction.gasPrice);
    }

    async getTransactionFeeByHash(transactionHash: string): Promise<BigNumber> {
        const transaction = (await this.web3Public.getTransactionByHash(transactionHash))!;
        const transactionReceipt = (await this.chain.web3.eth.getTransactionReceipt(
            transactionHash
        ))!;
        return new BigNumber(transactionReceipt.gasUsed).multipliedBy(transaction.gasPrice);
    }
}
