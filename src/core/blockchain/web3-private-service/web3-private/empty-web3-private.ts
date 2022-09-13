import { Web3Private } from 'src/core/blockchain/web3-private-service/web3-private/web3-private';
import { RubicSdkError } from 'src/common/errors';
import { TransactionReceipt } from 'web3-eth';

export class EmptyWeb3Private extends Web3Private {
    get address(): string {
        // @ts-ignore
        return undefined;
    }

    public constructor() {
        super();
    }

    checkBlockchainCorrect(): Promise<void> {
        throw new RubicSdkError('Trying to call empty web3 private');
    }

    executeContractMethod(): Promise<TransactionReceipt> {
        throw new RubicSdkError('Trying to call empty web3 private');
    }

    sendTransaction(): Promise<TransactionReceipt> {
        throw new RubicSdkError('Trying to call empty web3 private');
    }

    tryExecuteContractMethod(): Promise<TransactionReceipt> {
        throw new RubicSdkError('Trying to call empty web3 private');
    }

    trySendTransaction(): Promise<TransactionReceipt> {
        throw new RubicSdkError('Trying to call empty web3 private');
    }
}
