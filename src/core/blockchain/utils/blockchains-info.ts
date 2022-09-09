import { blockchains } from 'src/core/blockchain/constants/blockchains';
import { Blockchain } from 'src/core/blockchain/models/blockchain';
import {
    BitcoinBlockchainName,
    BLOCKCHAIN_NAME,
    BlockchainName,
    EVM_BLOCKCHAIN_NAME,
    EvmBlockchainName
} from 'src/core/blockchain/models/blockchain-name';
import BigNumber from 'bignumber.js';
import { CHAIN_TYPE } from 'src/core/blockchain/models/chain-type';
import { RubicSdkError } from 'src/common';

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
    public static getBlockchainByName<T extends BlockchainName = BlockchainName>(
        blockchainName: T
    ): Blockchain<T> {
        return BlockchainsInfo.blockchains.find(
            blockchain => blockchain.name === blockchainName
        )! as Blockchain<T>;
    }

    public static getChainType(blockchainName: BlockchainName): CHAIN_TYPE {
        if (this.isEvmBlockchainName(blockchainName)) {
            return CHAIN_TYPE.EVM;
        }
        if (this.isBitcoinBlockchainName(blockchainName)) {
            return CHAIN_TYPE.BITCOIN;
        }
        throw new RubicSdkError(`No supported chain type for ${blockchainName}`);
    }

    public static isEvmBlockchainName(
        blockchainName: BlockchainName
    ): blockchainName is EvmBlockchainName {
        return Object.values(EVM_BLOCKCHAIN_NAME).some(
            evmBlockchainName => evmBlockchainName === blockchainName
        );
    }

    public static isBitcoinBlockchainName(
        blockchainName: BlockchainName
    ): blockchainName is BitcoinBlockchainName {
        return blockchainName === BLOCKCHAIN_NAME.BITCOIN;
    }
}
