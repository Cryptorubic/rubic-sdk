import BigNumber from 'bignumber.js';
import { InvalidAddressError, RubicSdkError, WrongNetworkError } from 'src/common/errors';
import { BlockchainName } from 'src/core/blockchain/models/blockchain-name';
import { TypedWeb3Pure } from 'src/core/blockchain/web3-pure/typed-web3-pure/typed-web3-pure';

/**
 * Class containing methods for executing the functions of contracts
 * and sending transactions in order to change the state of the blockchain.
 * To get information from the blockchain use {@link Web3Public}.
 */
export abstract class Web3Private {
    /**
     * Converts number, string or BigNumber value to integer string.
     * @param amount Value to convert.
     */
    protected static stringifyAmount(amount: number | string | BigNumber): string {
        const bnAmount = new BigNumber(amount);
        if (!bnAmount.isInteger()) {
            throw new RubicSdkError(`Value ${amount} is not integer`);
        }

        return bnAmount.toFixed(0);
    }

    protected abstract readonly Web3Pure: TypedWeb3Pure;

    /**
     * @param address Current wallet provider address.
     */
    protected constructor(public address: string) {}

    public setAddress(address: string): void {
        this.address = address;
        this.checkAddressCorrect();
    }

    protected checkAddressCorrect(): void {
        if (!this.Web3Pure.isAddressCorrect(this.address)) {
            throw new InvalidAddressError(this.address);
        }
    }

    /**
     * Gets currently selected blockchain in wallet.
     */
    public abstract getBlockchainName(): Promise<BlockchainName | undefined>;

    /**
     * Checks, that selected blockchain in wallet is equal to passed blockchain.
     */
    public async checkBlockchainCorrect(blockchainName: BlockchainName): Promise<void | never> {
        const userBlockchainName = await this.getBlockchainName();
        if (userBlockchainName !== blockchainName) {
            throw new WrongNetworkError(blockchainName);
        }
    }
}
