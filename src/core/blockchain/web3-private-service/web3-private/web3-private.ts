import { TransactionOptions } from 'src/core/blockchain/models/transaction-options';
import { Web3Error } from 'src/common/errors/blockchain/web3.error';
import BigNumber from 'bignumber.js';
import { TransactionReceipt } from 'web3-eth';
import { AbiItem } from 'web3-utils';
import { BlockchainName } from 'src/core';

/**
 * Class containing methods for executing the functions of contracts
 * and sending transactions in order to change the state of the blockchain.
 * To get information from the blockchain use {@link Web3Public}.
 */
export abstract class Web3Private {
    /**
     * Current wallet provider address.
     */
    public abstract get address(): string;

    protected constructor() {}

    /**
     * Checks that blockchain in wallet equals passed blockchain.
     * @param blockchainName Blockchain to check equality with.
     */
    public abstract checkBlockchainCorrect(blockchainName: BlockchainName): Promise<void | never>;

    /**
     * Tries to send Eth in transaction and resolve the promise when the transaction is included in the block or rejects the error.
     * @param toAddress Eth receiver address.
     * @param value Native token amount in wei.
     * @param [options] Additional options.
     * @returns Transaction receipt.
     */
    public abstract trySendTransaction(
        toAddress: string,
        value: BigNumber | string,
        options: TransactionOptions
    ): Promise<TransactionReceipt>;

    /**
     * Sends Eth in transaction and resolve the promise when the transaction is included in the block.
     * @param toAddress Eth receiver address.
     * @param value Native token amount in wei.
     * @param [options] Additional options.
     * @returns Transaction receipt.
     */
    public abstract sendTransaction(
        toAddress: string,
        value: BigNumber | string,
        options: TransactionOptions
    ): Promise<TransactionReceipt>;

    /**
     * Tries to execute method of smart-contract and resolve the promise when the transaction is included in the block or rejects the error.
     * @param contractAddress Address of smart-contract which method is to be executed.
     * @param contractAbi Abi of smart-contract which method is to be executed.
     * @param methodName Method name to execute.
     * @param methodArguments Method arguments.
     * @param [options] Additional options.
     * @param allowError Check error and decides to execute contact if error is allowed.
     */
    public abstract tryExecuteContractMethod(
        contractAddress: string,
        contractAbi: AbiItem[],
        methodName: string,
        methodArguments: unknown[],
        options: TransactionOptions,
        allowError?: (err: Web3Error) => boolean
    ): Promise<TransactionReceipt>;

    /**
     * Executes method of smart-contract and resolve the promise when the transaction is included in the block.
     * @param contractAddress Address of smart-contract which method is to be executed.
     * @param contractAbi Abi of smart-contract which method is to be executed.
     * @param methodName Method name to execute.
     * @param methodArguments Method arguments.
     * @param [options] Additional options.
     * @returns Smart-contract method returned value.
     */
    public abstract executeContractMethod(
        contractAddress: string,
        contractAbi: AbiItem[],
        methodName: string,
        methodArguments: unknown[],
        options: TransactionOptions
    ): Promise<TransactionReceipt>;
}
