import { blockchains } from '@rsdk-core/blockchain/constants/blockchains';
import { Blockchain } from '@rsdk-core/blockchain/models/blockchain';
import { BlockchainName } from '@rsdk-core/blockchain/models/blockchain-name';
import BigNumber from 'bignumber.js';

/**
 * Works with list of all used in project blockchains.
 * Contains method to find info about certain blockchain.
 */
export class BlockchainsInfo {
    /**
     * An array of all blockchains, used in project.
     */
    public static readonly blockchains: ReadonlyArray<Blockchain> = blockchains;

    /**
     * Finds blockchain object, based on provided chain id.
     */
    public static getBlockchainById(chainId: string | number): Blockchain | undefined {
        const chainIdNumber = new BigNumber(chainId).toNumber();
        return BlockchainsInfo.blockchains.find(blockchain => blockchain.id === chainIdNumber);
    }

    /**
     * Finds blockchain object, based on provided blockchain name.
     */
    public static getBlockchainByName(blockchainName: BlockchainName): Blockchain {
        return BlockchainsInfo.blockchains.find(blockchain => blockchain.name === blockchainName)!;
    }
}
