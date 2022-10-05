import { Web3Private } from 'src/core/blockchain/web3-private-service/web3-private/web3-private';
import { RubicSdkError } from 'src/common/errors';
import { BlockchainName } from 'src/core/blockchain/models/blockchain-name';
import { TypedWeb3Pure } from 'src/core/blockchain/web3-pure/typed-web3-pure/typed-web3-pure';

export class EmptyWeb3Private extends Web3Private {
    protected readonly Web3Pure = undefined as unknown as TypedWeb3Pure;

    constructor() {
        super(undefined as unknown as string);
    }

    public getBlockchainName(): Promise<BlockchainName | undefined> {
        throw new RubicSdkError('Trying to call empty web3 private');
    }
}
