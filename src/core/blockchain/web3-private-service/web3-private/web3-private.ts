import { BlockchainName } from 'src/core/blockchain/models/blockchain-name';

/**
 * Class containing methods for executing the functions of contracts
 * and sending transactions in order to change the state of the blockchain.
 * To get information from the blockchain use {@link Web3Public}.
 */
export abstract class Web3Private {
    /**
     * @param address Current wallet provider address.
     */
    protected constructor(public address: string) {}

    /**
     * Gets currently selected blockchain in wallet.
     */
    public abstract getBlockchainName(): Promise<BlockchainName | undefined>;
}
