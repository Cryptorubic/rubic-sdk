import { BlockchainName } from 'src/core/blockchain/models/blockchain-name';
import { TypedWeb3Pure } from 'src/core/blockchain/web3-pure/typed-web3-pure/typed-web3-pure';
import { InvalidAddressError } from 'src/common/errors/blockchain/invalid-address.error';

/**
 * Class containing methods for executing the functions of contracts
 * and sending transactions in order to change the state of the blockchain.
 * To get information from the blockchain use {@link Web3Public}.
 */
export abstract class Web3Private {
    protected abstract readonly Web3Pure: TypedWeb3Pure;

    /**
     * @param address Current wallet provider address.
     */
    protected constructor(public address: string) {}

    protected checkAddressCorrect(): void {
        if (!this.Web3Pure.isAddressCorrect(this.address)) {
            throw new InvalidAddressError(this.address);
        }
    }

    /**
     * Gets currently selected blockchain in wallet.
     */
    public abstract getBlockchainName(): Promise<BlockchainName | undefined>;
}
