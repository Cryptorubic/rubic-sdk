import BigNumber from 'bignumber.js';
import { RubicSdkError } from 'src/common/errors';
import {
    BitcoinBlockchainName,
    BLOCKCHAIN_NAME,
    BlockchainName,
    EVM_BLOCKCHAIN_NAME,
    EvmBlockchainName,
    TronBlockchainName
} from 'src/core/blockchain/models/blockchain-name';
import { CHAIN_TYPE } from 'src/core/blockchain/models/chain-type';
import { blockchainId } from 'src/core/blockchain/utils/blockchains-info/constants/blockchain-id';
import { chainTypeByBlockchain } from 'src/core/blockchain/utils/blockchains-info/constants/chain-type-by-blockchain';

/**
 * Works with list of all used in project blockchains.
 * Contains method to find info about certain blockchain.
 */
export class BlockchainsInfo {
    /**
     * Finds blockchain name, based on provided chain id.
     */
    public static getBlockchainNameById(chainId: string | number): BlockchainName | undefined {
        const chainIdNumber = new BigNumber(chainId).toNumber();
        return Object.entries(blockchainId).find(
            ([_, id]) => id === chainIdNumber
        )?.[0] as BlockchainName;
    }

    public static getChainType(blockchainName: BlockchainName): CHAIN_TYPE {
        const chainType = chainTypeByBlockchain[blockchainName];
        if (!chainType) {
            throw new RubicSdkError(`No supported chain type for ${blockchainName}`);
        }
        return chainType;
    }

    public static isBlockchainName(chain: string): chain is BlockchainName {
        return Object.values(BLOCKCHAIN_NAME).some(blockchainName => blockchainName === chain);
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

    public static isTronBlockchainName(
        blockchainName: BlockchainName
    ): blockchainName is TronBlockchainName {
        return blockchainName === BLOCKCHAIN_NAME.TRON;
    }
}
