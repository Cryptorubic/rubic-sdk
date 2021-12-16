import BigNumber from 'bignumber.js';
import { TransactionReceipt } from 'web3-eth';
import { AbiItem } from 'web3-utils';
import { TransactionOptions } from '../models/transaction-options';
import { ProviderConnector } from '../models/provider-connector';
import { Web3Error } from '../models/web3-error';
export declare class Web3Private {
    private readonly providerConnector;
    private readonly web3;
    private get address();
    private static stringifyAmount;
    constructor(providerConnector: ProviderConnector);
    private static parseError;
    transferTokens(contractAddress: string, toAddress: string, amount: string | BigNumber, options?: TransactionOptions): Promise<TransactionReceipt>;
    transferTokensWithOnHashResolve(contractAddress: string, toAddress: string, amount: string | BigNumber, options?: TransactionOptions): Promise<string>;
    trySendTransaction(toAddress: string, value: BigNumber | string, options?: TransactionOptions): Promise<TransactionReceipt>;
    sendTransaction(toAddress: string, value: BigNumber | string, options?: TransactionOptions): Promise<TransactionReceipt>;
    sendTransactionWithOnHashResolve(toAddress: string, value: string | BigNumber, options?: TransactionOptions): Promise<string>;
    approveTokens(tokenAddress: string, spenderAddress: string, value: BigNumber | 'infinity', options?: TransactionOptions): Promise<TransactionReceipt>;
    tryExecuteContractMethod(contractAddress: string, contractAbi: AbiItem[], methodName: string, methodArguments: unknown[], options?: TransactionOptions, allowError?: (err: Web3Error) => boolean): Promise<TransactionReceipt>;
    executeContractMethod(contractAddress: string, contractAbi: AbiItem[], methodName: string, methodArguments: unknown[], options?: TransactionOptions): Promise<TransactionReceipt>;
    executeContractMethodWithOnHashResolve(contractAddress: string, contractAbi: AbiItem[], methodName: string, methodArguments: unknown[], options?: TransactionOptions): Promise<unknown>;
    unApprove(tokenAddress: string, spenderAddress: string): Promise<TransactionReceipt>;
}
