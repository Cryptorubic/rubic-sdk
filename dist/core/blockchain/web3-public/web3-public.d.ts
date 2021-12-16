import { BLOCKCHAIN_NAME } from '../models/BLOCKCHAIN_NAME';
import { BatchCall } from './models/batch-call';
import { ContractMulticallResponse } from './models/contract-multicall-response';
import Web3 from 'web3';
import BigNumber from 'bignumber.js';
import { Method } from 'web3-core-method';
import { Transaction, provider as Provider, BlockNumber } from 'web3-core';
import { AbiItem } from 'web3-utils';
import { BlockTransactionString } from 'web3-eth';
import { HttpClient } from '../../../common/models/http-client';
import { MethodData } from './models/method-data';
declare type SupportedTokenField = 'decimals' | 'symbol' | 'name' | 'totalSupply';
/**
 * Class containing methods for calling contracts in order to obtain information from the blockchain.
 * To send transaction or execute contract method use {@link Web3Private}.
 */
export declare class Web3Public {
    private readonly web3;
    private readonly blockchainName;
    private httpClient?;
    private multicallAddresses;
    private readonly clearController;
    /**
     * @param web3 web3 instance initialized with ethereum provider, e.g. rpc link
     * @param blockchainName blockchain in which you need to execute requests
     * @param [httpClient=axios] http client that implements {@link HttpClient} interface
     */
    constructor(web3: Web3, blockchainName: BLOCKCHAIN_NAME, httpClient?: HttpClient | undefined);
    /**
     * HealthCheck current rpc node
     * @param timeoutMs acceptable node response timeout
     * @return null if healthcheck is not defined for current blockchain, else is node works status
     */
    healthCheck(timeoutMs?: number): Promise<boolean>;
    /**
     * @description set new provider to web3 instance
     * @param provider new web3 provider, e.g. rpc link
     */
    setProvider(provider: Provider): void;
    /**
     * @description gets block by blockId
     * @param [blockId] block id: hash, number ... Default is 'latest'.
     * @returns {BlockTransactionString} block by blockId parameter.
     */
    getBlock(blockId?: BlockNumber | string): Promise<BlockTransactionString>;
    /**
     * @description gets account eth or token balance as integer (multiplied to 10 ** decimals)
     * @param address wallet address whose balance you want to find out
     * @param [tokenAddress] address of the smart-contract corresponding to the token, or {@link NATIVE_TOKEN_ADDRESS}.
     * If not passed the balance in the native currency will be returned.
     * @returns address eth or token balance as integer (multiplied to 10 ** decimals)
     */
    getBalance(address: string, tokenAddress?: string): Promise<BigNumber>;
    /**
     * @description gets ERC-20 tokens balance as integer (multiplied to 10 ** decimals)
     * @param tokenAddress address of the smart-contract corresponding to the token
     * @param address wallet address whose balance you want to find out
     * @returns address tokens balance as integer (multiplied to 10 ** decimals)
     */
    getTokenBalance(address: string, tokenAddress: string): Promise<BigNumber>;
    /**
     * @description predicts the volume of gas required to execute the contract method
     * @param contractAbi abi of smart-contract
     * @param contractAddress address of smart-contract
     * @param methodName method whose execution gas number is to be calculated
     * @param methodArguments arguments of the executed contract method
     * @param fromAddress the address for which the gas calculation will be called
     * @param [value] The value transferred for the call “transaction” in wei.
     * @return The gas amount estimated
     */
    getEstimatedGas(contractAbi: AbiItem[], contractAddress: string, methodName: string, methodArguments: unknown[], fromAddress: string, value?: string | BigNumber): Promise<BigNumber | null>;
    /**
     * @description calculates the average price per unit of gas according to web3
     * @return average gas price in Wei
     */
    getGasPrice(): Promise<string>;
    /**
     * @description calculates the average price per unit of gas according to web3
     * @return average gas price in ETH
     */
    getGasPriceInETH(): Promise<BigNumber>;
    /**
     * @description calculates the gas fee using average price per unit of gas according to web3 and Eth price according to coingecko
     * @param gasLimit gas limit
     * @param etherPrice price of Eth unit
     * @return gas fee in usd$
     */
    getGasFee(gasLimit: BigNumber, etherPrice: BigNumber): Promise<BigNumber>;
    /**
     * @description executes allowance method in ERC-20 token contract
     * @param tokenAddress address of the smart-contract corresponding to the token
     * @param spenderAddress wallet or contract address, allowed to spend
     * @param ownerAddress wallet address to spend from
     * @return tokens amount, allowed to be spent
     */
    getAllowance(tokenAddress: string, ownerAddress: string, spenderAddress: string): Promise<BigNumber>;
    /**
     * @description gets mined transaction gas fee in Ether
     * @param hash transaction hash
     * @return transaction gas fee in Wei or null if transaction is not mined
     */
    getTransactionGasFee(hash: string): Promise<BigNumber | null>;
    /**
     * @description get a transaction by hash in several attempts
     * @param hash hash of the target transaction
     * @param attempt current attempt number
     * @param attemptsLimit maximum allowed number of attempts
     * @param delay ms delay before next attempt
     */
    getTransactionByHash(hash: string, attempt?: number, attemptsLimit?: number, delay?: number): Promise<Transaction | null>;
    /**
     * @description call smart-contract pure method of smart-contract and returns its output value
     * @param contractAddress address of smart-contract which method is to be executed
     * @param contractAbi abi of smart-contract which method is to be executed
     * @param methodName calling method name
     * @param [options] additional options
     * @param [options.from] the address the call “transaction” should be made from
     * @param [options.methodArguments] executing method arguments
     * @return smart-contract pure method returned value
     */
    callContractMethod<T = string>(contractAddress: string, contractAbi: AbiItem[], methodName: string, options?: {
        methodArguments?: unknown[];
        from?: string;
        value?: string;
    }): Promise<T>;
    /**
     * @description get balance of multiple tokens via multicall
     * @param address wallet address
     * @param tokensAddresses tokens addresses
     */
    getTokensBalances(address: string, tokensAddresses: string[]): Promise<BigNumber[]>;
    /**
     * Uses multicall to make several calls of one method in one contract.
     * @param contractAddress Target contract address.
     * @param contractAbi Target contract abi.
     * @param methodName target method name
     * @param methodCallsArguments list method calls parameters arrays
     */
    multicallContractMethod<Output>(contractAddress: string, contractAbi: AbiItem[], methodName: string, methodCallsArguments: unknown[][]): Promise<ContractMulticallResponse<Output>[]>;
    /**
     * Uses multicall to make several methods calls in one contract.
     * @param contractAddress Target contract address.
     * @param contractAbi Target contract abi.
     * @param methodsData Methods data, containing methods' names and arguments.
     */
    multicallContractMethods<Output>(contractAddress: string, contractAbi: AbiItem[], methodsData: MethodData[]): Promise<ContractMulticallResponse<Output>[]>;
    /**
     * Uses multicall to make many methods calls in several contracts.
     * @param contractAbi Target contract abi.
     * @param contractsData Contract addresses and methods data, containing methods' names and arguments.
     */
    multicallContractsMethods<Output>(contractAbi: AbiItem[], contractsData: {
        contractAddress: string;
        methodsData: MethodData[];
    }[]): Promise<ContractMulticallResponse<Output>[][]>;
    /**
     * @description Checks if the specified address contains the required amount of these tokens.
     * Throws an InsufficientFundsError if the balance is insufficient
     * @param token token balance for which you need to check
     * @param amount required balance
     * @param userAddress the address where the required balance should be
     */
    checkBalance(token: {
        address: string;
        symbol: string;
        decimals: number;
    }, amount: BigNumber, userAddress: string): Promise<void>;
    /**
     * Gets ERC-20 token info by address.
     * @param tokenAddress Address of token.
     * @param tokenFields Token's fields to get.
     */
    callForTokenInfo(tokenAddress: string, tokenFields?: SupportedTokenField[]): Promise<Partial<Record<SupportedTokenField, string>>>;
    /**
     * Gets ERC-20 tokens info by addresses.
     * @param tokenAddresses Addresses of tokens.
     */
    callForTokensInfo(tokenAddresses: string[] | ReadonlyArray<string>): Promise<Record<SupportedTokenField, string | undefined>[]>;
    /**
     * @description get estimated gas of several contract method execution via rpc batch request
     * @param abi contract ABI
     * @param contractAddress contract address
     * @param fromAddress sender address
     * @param callsData transactions parameters
     * @returns list of contract execution estimated gases.
     * if the execution of the method in the real blockchain would not be reverted,
     * then the list item would be equal to the predicted gas limit.
     * Else (if you have not enough balance, allowance ...) then the list item would be equal to null
     */
    batchEstimatedGas(abi: AbiItem[], contractAddress: string, fromAddress: string, callsData: BatchCall[]): Promise<(BigNumber | null)[]>;
    /**
     * @description send batch request via web3
     * @see {@link https://web3js.readthedocs.io/en/v1.3.0/web3-eth.html#batchrequest|Web3BatchRequest}
     * @param calls Web3 method calls
     * @param callsParams ethereum method transaction parameters
     * @returns batch request call result sorted in order of input parameters
     */
    web3BatchRequest<T extends string | string[]>(calls: {
        request: (...params: unknown[]) => Method;
    }[], callsParams: Object[]): Promise<T[]>;
    /**
     * @description send batch request to rpc provider directly
     * @see {@link https://playground.open-rpc.org/?schemaUrl=https://raw.githubusercontent.com/ethereum/eth1.0-apis/assembled-spec/openrpc.json&uiSchema%5BappBar%5D%5Bui:splitView%5D=false&uiSchema%5BappBar%5D%5Bui:input%5D=false&uiSchema%5BappBar%5D%5Bui:examplesDropdown%5D=false|EthereumJSON-RPC}
     * @param rpcCallsData rpc methods and parameters list
     * @returns rpc batch request call result sorted in order of input 1parameters
     */
    rpcBatchRequest<T extends string | string[]>(rpcCallsData: {
        rpcMethod: string;
        params: Object;
    }[]): Promise<(T | null)[]>;
    /**
     * @description execute multiplie calls in the single contract call
     * @param calls multicall calls data list
     * @return result of calls execution
     */
    private multicall;
    /**
     * @description returns httpClient if it exists or imports the axios client
     */
    private getHttpClient;
}
export {};
