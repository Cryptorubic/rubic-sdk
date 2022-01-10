import { TransactionOptions } from '../models/transaction-options';
import { Web3Error } from '../../../common/errors/blockchain/web3.error';
import BigNumber from 'bignumber.js';
import { TransactionReceipt } from 'web3-eth';
import { AbiItem } from 'web3-utils';
import { WalletConnectionConfiguration } from '../models/wallet-connection-configuration';
/**
 * Class containing methods for executing the functions of contracts and sending transactions in order to change the state of the blockchain.
 * To get information from the blockchain use {@link Web3Public}.
 */
export declare class Web3Private {
    private readonly walletConnectionConfiguration;
    /**
     * @description instance of web3, initialized with ethereum wallet, e.g. Metamask, WalletConnect
     */
    private readonly web3;
    /**
     * @description current wallet provider address
     */
    get address(): string;
    /**
     * @description current wallet blockchainName
     */
    get blockchainName(): string;
    /**
     * @description converts number, string or BigNumber value to integer string
     * @param amount value to convert
     */
    private static stringifyAmount;
    /**
     * @param walletConnectionConfiguration provider that implements {@link WalletConnectionConfiguration} interface.
     * The provider must contain an instance of web3, initialized with ethereum wallet, e.g. Metamask, WalletConnect
     */
    constructor(walletConnectionConfiguration: WalletConnectionConfiguration);
    /**
     * @description parse web3 error by its code
     * @param err web3 error to parse
     */
    private static parseError;
    /**
     * @description sends ERC-20 tokens and resolve the promise when the transaction is included in the block
     * @param contractAddress address of the smart-contract corresponding to the token
     * @param toAddress token receiver address
     * @param amount integer tokens amount to send (pre-multiplied by 10 ** decimals)
     * @param [options] additional options
     * @param [options.onTransactionHash] callback to execute when transaction enters the mempool
     * @return transaction receipt
     */
    transferTokens(contractAddress: string, toAddress: string, amount: string | BigNumber, options?: TransactionOptions): Promise<TransactionReceipt>;
    /**
     * @description sends ERC-20 tokens and resolve the promise without waiting for the transaction to be included in the block
     * @param contractAddress address of the smart-contract corresponding to the token
     * @param toAddress token receiver address
     * @param amount integer tokens amount to send (pre-multiplied by 10 ** decimals)
     * @param [options] additional options
     * @param [options.onTransactionHash] callback to execute when transaction enters the mempool
     * @return transaction hash
     */
    transferTokensWithOnHashResolve(contractAddress: string, toAddress: string, amount: string | BigNumber, options?: TransactionOptions): Promise<string>;
    /**
     * @description tries to send Eth in transaction and resolve the promise when the transaction is included in the block or rejects the error
     * @param toAddress Eth receiver address
     * @param value amount in Eth units
     * @param [options] additional options
     * @param [options.onTransactionHash] callback to execute when transaction enters the mempool
     * @param [options.inWei = false] boolean flag for determining the input parameter "value" in Wei
     * @param [options.data] data for calling smart contract methods.
     *    Use this field only if you are receiving data from a third-party api.
     *    When manually calling contract methods, use executeContractMethod()
     * @param [options.gas] transaction gas limit in absolute gas units
     * @param [options.gasPrice] price of gas unit in wei
     * @return transaction receipt
     */
    trySendTransaction(toAddress: string, value: BigNumber | string, options?: TransactionOptions): Promise<TransactionReceipt>;
    /**
     * @description sends Eth in transaction and resolve the promise when the transaction is included in the block
     * @param toAddress Eth receiver address
     * @param value amount in Eth units
     * @param [options] additional options
     * @param [options.onTransactionHash] callback to execute when transaction enters the mempool
     * @param [options.inWei = false] boolean flag for determining the input parameter "value" in Wei
     * @param [options.data] data for calling smart contract methods.
     *    Use this field only if you are receiving data from a third-party api.
     *    When manually calling contract methods, use executeContractMethod()
     * @param [options.gas] transaction gas limit in absolute gas units
     * @param [options.gasPrice] price of gas unit in wei
     * @return transaction receipt
     */
    sendTransaction(toAddress: string, value: BigNumber | string, options?: TransactionOptions): Promise<TransactionReceipt>;
    /**
     * @description sends Eth in transaction and resolve the promise without waiting for the transaction to be included in the block
     * @param toAddress Eth receiver address
     * @param value amount in Eth units
     * @param [options] additional options
     * @param [options.inWei = false] boolean flag for determining the input parameter "value" in Wei
     * @return transaction hash
     */
    sendTransactionWithOnHashResolve(toAddress: string, value: string | BigNumber, options?: TransactionOptions): Promise<string>;
    /**
     * @description executes approve method in ERC-20 token contract
     * @param tokenAddress address of the smart-contract corresponding to the token
     * @param spenderAddress wallet or contract address to approve
     * @param value integer value to approve (pre-multiplied by 10 ** decimals)
     * @param [options] additional options
     * @param [options.onTransactionHash] callback to execute when transaction enters the mempool
     * @return approval transaction receipt
     */
    approveTokens(tokenAddress: string, spenderAddress: string, value: BigNumber | 'infinity', options?: TransactionOptions): Promise<TransactionReceipt>;
    /**
     * @description tries to execute method of smart-contract and resolve the promise when the transaction is included in the block or rejects the error
     * @param contractAddress address of smart-contract which method is to be executed
     * @param contractAbi abi of smart-contract which method is to be executed
     * @param methodName executing method name
     * @param methodArguments executing method arguments
     * @param [options] additional options
     * @param [options.value] amount in Wei amount to be attached to the transaction
     * @param [options.gas] gas limit to be attached to the transaction
     * @param allowError Check error and decides to execute contact if it needed.
     */
    tryExecuteContractMethod(contractAddress: string, contractAbi: AbiItem[], methodName: string, methodArguments: unknown[], options?: TransactionOptions, allowError?: (err: Web3Error) => boolean): Promise<TransactionReceipt>;
    /**
     * @description executes method of smart-contract and resolve the promise when the transaction is included in the block
     * @param contractAddress address of smart-contract which method is to be executed
     * @param contractAbi abi of smart-contract which method is to be executed
     * @param methodName executing method name
     * @param methodArguments executing method arguments
     * @param [options] additional options
     * @param [options.onTransactionHash] callback to execute when transaction enters the mempool
     * @param [options.value] amount in Wei amount to be attached to the transaction
     * @return smart-contract method returned value
     */
    executeContractMethod(contractAddress: string, contractAbi: AbiItem[], methodName: string, methodArguments: unknown[], options?: TransactionOptions): Promise<TransactionReceipt>;
    /**
     * @description executes method of smart-contract and resolve the promise without waiting for the transaction to be included in the block
     * @param contractAddress address of smart-contract which method is to be executed
     * @param contractAbi abi of smart-contract which method is to be executed
     * @param methodName executing method name
     * @param methodArguments executing method arguments
     * @param [options] additional options
     * @param [options.onTransactionHash] callback to execute when transaction enters the mempool
     * @param [options.value] amount in Wei amount to be attached to the transaction
     * @return smart-contract method returned value
     */
    executeContractMethodWithOnHashResolve(contractAddress: string, contractAbi: AbiItem[], methodName: string, methodArguments: unknown[], options?: TransactionOptions): Promise<unknown>;
    /**
     * @description removes approval for token use
     * @param tokenAddress tokenAddress address of the smart-contract corresponding to the token
     * @param spenderAddress wallet or contract address to approve
     */
    unApprove(tokenAddress: string, spenderAddress: string): Promise<TransactionReceipt>;
}
