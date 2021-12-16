import Web3 from 'web3';
import BigNumber from 'bignumber.js';
import { Method } from 'web3-core-method';
import { Transaction, provider as Provider, BlockNumber } from 'web3-core';
import { AbiItem } from 'web3-utils';
import { BlockTransactionString } from 'web3-eth';
import { Blockchain } from '../models/blockchain';
import { ContractMulticallResponse } from './models/contract-multicall-response';
import { BatchCall } from './models/batch-call';
import { HttpClient } from '../../common/models/http-client';
export declare class Web3Public {
    private web3;
    blockchain: Blockchain;
    private httpClient?;
    private multicallAddresses;
    constructor(web3: Web3, blockchain: Blockchain, httpClient?: HttpClient | undefined);
    static get nativeTokenAddress(): string;
    static calculateGasMargin(amount: BigNumber | string | number, percent: number): string;
    static toWei(amount: BigNumber | string | number, decimals?: number): string;
    static fromWei(amountInWei: BigNumber | string | number, decimals?: number): BigNumber;
    static addressToBytes32(address: string): string;
    static toChecksumAddress(address: string): string;
    static isAddressCorrect(address: string): boolean;
    static ethToWei(value: string | BigNumber): string;
    static weiToEth(value: string | BigNumber): string;
    static isNativeAddress: (address: string) => boolean;
    setProvider(provider: Provider): void;
    getBlock(blockId?: BlockNumber | string): Promise<BlockTransactionString>;
    getBalance(address: string, tokenAddress?: string): Promise<BigNumber>;
    getTokenBalance(address: string, tokenAddress: string): Promise<BigNumber>;
    getEstimatedGas(contractAbi: AbiItem[], contractAddress: string, methodName: string, methodArguments: unknown[], fromAddress: string, value?: string | BigNumber): Promise<BigNumber>;
    getGasPrice(): Promise<string>;
    getGasPriceInETH(): Promise<BigNumber>;
    getGasFee(gasLimit: BigNumber, etherPrice: BigNumber): Promise<BigNumber>;
    getAllowance(tokenAddress: string, ownerAddress: string, spenderAddress: string): Promise<BigNumber>;
    getTransactionGasFee(hash: string): Promise<BigNumber | null>;
    getTransactionByHash(hash: string, attempt?: number, attemptsLimit?: number, delay?: number): Promise<Transaction | null>;
    callContractMethod(contractAddress: string, contractAbi: AbiItem[], methodName: string, options?: {
        methodArguments?: unknown[];
        from?: string;
    }): Promise<string | string[]>;
    getTokensBalances(address: string, tokensAddresses: string[]): Promise<BigNumber[]>;
    multicallContractMethod<Output>(contractAddress: string, contractAbi: AbiItem[], methodName: string, methodCallsArguments: unknown[][]): Promise<ContractMulticallResponse<Output>[]>;
    checkBalance(token: {
        address: string;
        symbol: string;
        decimals: number;
    }, amount: BigNumber, userAddress: string): Promise<void>;
    batchEstimatedGas(abi: AbiItem[], contractAddress: string, fromAddress: string, callsData: BatchCall[]): Promise<(BigNumber | null)[]>;
    web3BatchRequest<T extends string | string[]>(calls: {
        request: (...params: unknown[]) => Method;
    }[], callsParams: Object[]): Promise<T[]>;
    rpcBatchRequest<T extends string | string[]>(rpcCallsData: {
        rpcMethod: string;
        params: Object;
    }[]): Promise<(T | null)[]>;
    private multicall;
    private getHttpClient;
}
