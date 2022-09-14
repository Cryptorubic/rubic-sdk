import { Web3Private } from 'src/core/blockchain/web3-private-service/web3-private/web3-private';
import { RubicSdkError } from 'src/common/errors';
import { BlockchainName } from 'src/core/blockchain/models/blockchain-name';

export class EmptyWeb3Private extends Web3Private {
    constructor() {
        super(undefined as unknown as string);
    }

    public getBlockchainName(): Promise<BlockchainName | undefined> {
        throw new RubicSdkError('Trying to call empty web3 private');
    }
}
