import { BlockchainName } from '@cryptorubic/core';
import { TransactionReceipt } from 'web3-eth';

export class CrossChainCbridgeManager {
    public static async getTransferId(
        _sourceTransaction: string,
        _fromBlockchain: BlockchainName
    ): Promise<string> {
        // @TODO API
        throw new Error('Not supported yet');
    }

    public static async makeRefund(
        _fromBlockchain: BlockchainName,
        _sourceTransaction: string,
        _estimateAmount: string,
        _onTransactionHash: (hash: string) => void
    ): Promise<TransactionReceipt | null> {
        // @TODO API
        throw new Error('Not supported yet');
    }

    private static async transferRefund(
        _fromBlockchain: BlockchainName,
        _statusResponse: unknown,
        _onTransactionHash: (hash: string) => void
    ): Promise<TransactionReceipt> {
        // @TODO API
        throw new Error('Not supported yet');
    }
}
