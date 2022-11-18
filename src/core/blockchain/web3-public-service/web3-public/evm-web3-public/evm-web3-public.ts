import { Web3Public } from 'src/core/blockchain/web3-public-service/web3-public/web3-public';
import { RubicSdkError, TimeoutError } from 'src/common/errors';
import { BatchCall } from 'src/core/blockchain/web3-public-service/web3-public/evm-web3-public/models/batch-call';
import { RpcResponse } from 'src/core/blockchain/web3-public-service/web3-public/evm-web3-public/models/rpc-response';
import { EvmMulticallResponse } from 'src/core/blockchain/web3-public-service/web3-public/evm-web3-public/models/evm-multicall-response';
import { DefaultHttpClient } from 'src/core/http-client/default-http-client';
import {
    HEALTHCHECK,
    isBlockchainHealthcheckAvailable
} from 'src/core/blockchain/constants/healthcheck';
import { EVM_MULTICALL_ABI } from 'src/core/blockchain/web3-public-service/web3-public/evm-web3-public/constants/evm-multicall-abi';
import Web3 from 'web3';
import { ContractMulticallResponse } from 'src/core/blockchain/web3-public-service/web3-public/models/contract-multicall-response';
import { AbiItem } from 'web3-utils';
import { EvmCall } from 'src/core/blockchain/web3-public-service/web3-public/evm-web3-public/models/evm-call';
import { TransactionReceipt, BlockTransactionString } from 'web3-eth';
import { EvmBlockchainName } from 'src/core/blockchain/models/blockchain-name';
import { provider as Provider, HttpProvider, BlockNumber } from 'web3-core';
import { HttpClient } from 'src/core/http-client/models/http-client';
import { MethodData } from 'src/core/blockchain/web3-public-service/web3-public/models/method-data';
import pTimeout from 'src/common/utils/p-timeout';
import { EvmWeb3Pure } from 'src/core/blockchain/web3-pure/typed-web3-pure/evm-web3-pure';
import { ERC20_TOKEN_ABI } from 'src/core/blockchain/web3-public-service/web3-public/evm-web3-public/constants/erc-20-token-abi';
import BigNumber from 'bignumber.js';
import { EventData } from 'web3-eth-contract';
import { Web3PrimitiveType } from 'src/core/blockchain/models/web3-primitive-type';
import { TxStatus } from 'src/core/blockchain/web3-public-service/web3-public/models/tx-status';

/**
 * Class containing methods for calling contracts in order to obtain information from the blockchain.
 * To send transaction or execute contract method use {@link Web3Private}.
 */
export class EvmWeb3Public extends Web3Public {
    protected readonly tokenContractAbi = ERC20_TOKEN_ABI;

    constructor(
        private readonly web3: Web3,
        blockchainName: EvmBlockchainName,
        private httpClient?: HttpClient
    ) {
        super(blockchainName);
    }

    public setProvider(provider: Provider): void {
        this.web3.setProvider(provider);
    }

    public async healthCheck(timeoutMs: number = 4000): Promise<boolean> {
        if (!isBlockchainHealthcheckAvailable(this.blockchainName)) {
            return true;
        }
        const healthcheckData = HEALTHCHECK[this.blockchainName];

        const contract = new this.web3.eth.Contract(
            healthcheckData.contractAbi,
            healthcheckData.contractAddress
        );

        try {
            const result = await pTimeout(
                contract.methods[healthcheckData.method]().call(),
                timeoutMs
            );
            return result === healthcheckData.expected;
        } catch (e: unknown) {
            if (e instanceof TimeoutError) {
                console.debug(
                    `${this.blockchainName} node healthcheck timeout (${timeoutMs}ms) has occurred.`
                );
            } else {
                console.debug(`${this.blockchainName} node healthcheck fail: ${e}`);
            }
            return false;
        }
    }

    public async getBalance(userAddress: string, tokenAddress?: string): Promise<BigNumber> {
        let balance;
        if (tokenAddress && !EvmWeb3Pure.isNativeAddress(tokenAddress)) {
            balance = await this.getTokenBalance(userAddress, tokenAddress);
        } else {
            balance = await this.web3.eth.getBalance(userAddress);
        }
        return new BigNumber(balance);
    }

    public async getTokenBalance(userAddress: string, tokenAddress: string): Promise<BigNumber> {
        const contract = new this.web3.eth.Contract(this.tokenContractAbi, tokenAddress);

        const balance = await contract.methods.balanceOf(userAddress).call();
        return new BigNumber(balance);
    }

    public async getAllowance(
        tokenAddress: string,
        ownerAddress: string,
        spenderAddress: string
    ): Promise<BigNumber> {
        const contract = new this.web3.eth.Contract(this.tokenContractAbi, tokenAddress);

        const allowance = await contract.methods.allowance(ownerAddress, spenderAddress).call();
        return new BigNumber(allowance);
    }

    public async multicallContractsMethods<Output extends Web3PrimitiveType>(
        contractAbi: AbiItem[],
        contractsData: {
            contractAddress: string;
            methodsData: MethodData[];
        }[]
    ): Promise<ContractMulticallResponse<Output>[][]> {
        const calls: EvmCall[][] = contractsData.map(({ contractAddress, methodsData }) => {
            const contract = new this.web3.eth.Contract(contractAbi, contractAddress);
            return methodsData.map(({ methodName, methodArguments }) => ({
                callData: contract.methods[methodName](...methodArguments).encodeABI(),
                target: contractAddress
            }));
        });

        const outputs = await this.multicall(calls.flat());

        let outputIndex = 0;
        return contractsData.map(contractData =>
            contractData.methodsData.map(methodData => {
                const methodOutputAbi = contractAbi.find(
                    funcSignature => funcSignature.name === methodData.methodName
                )!.outputs!;
                const output = outputs[outputIndex];
                if (!output) {
                    throw new RubicSdkError('Output has to be defined');
                }

                outputIndex++;

                return {
                    success: output.success,
                    output:
                        output.success && output.returnData.length > 2
                            ? (this.web3.eth.abi.decodeParameters(
                                  methodOutputAbi,
                                  output.returnData
                              )[0] as Output)
                            : null
                };
            })
        );
    }

    /**
     * Executes multiple calls in the single contract call.
     * @param calls Multicall calls data list.
     * @returns Result of calls execution.
     */
    private async multicall(calls: EvmCall[]): Promise<EvmMulticallResponse[]> {
        const contract = new this.web3.eth.Contract(EVM_MULTICALL_ABI, this.multicallAddress);
        return contract.methods.tryAggregate(false, calls).call();
    }

    public async callContractMethod<T extends Web3PrimitiveType = string>(
        contractAddress: string,
        contractAbi: AbiItem[],
        methodName: string,
        methodArguments: unknown[] = [],
        options: {
            from?: string;
            value?: string;
        } = {}
    ): Promise<T> {
        const contract = new this.web3.eth.Contract(contractAbi, contractAddress);

        return contract.methods[methodName](...methodArguments).call({
            ...(options.from && { from: options.from }),
            ...(options.value && { value: options.value })
        });
    }

    /**
     * Predicts the volume of gas required to execute the contract method.
     * @param contractAbi Abi of smart-contract.
     * @param contractAddress Address of smart-contract.
     * @param methodName Method which execution gas limit is to be calculated.
     * @param methodArguments Arguments of the contract method.
     * @param fromAddress The address for which the gas calculation will be called.
     * @param value The value transferred for the call “transaction” in wei.
     * @returns Estimated gas limit.
     */
    public async getEstimatedGas(
        contractAbi: AbiItem[],
        contractAddress: string,
        methodName: string,
        methodArguments: unknown[],
        fromAddress: string,
        value?: string | BigNumber
    ): Promise<BigNumber | null> {
        const contract = new this.web3.eth.Contract(contractAbi, contractAddress);

        try {
            const gasLimit = await contract.methods[methodName](...methodArguments).estimateGas({
                from: fromAddress,
                gas: 10000000,
                ...(value && { value })
            });
            return new BigNumber(gasLimit);
        } catch (err) {
            console.debug(err);
            return null;
        }
    }

    /**
     * Get estimated gas of several contract method executions via rpc batch request.
     * @param abi Contract ABI.
     * @param contractAddress Contract address.
     * @param fromAddress Sender address.
     * @param callsData Transactions parameters.
     * @returns List of contract execution estimated gases.
     * If the execution of the method in the real blockchain would not be reverted,
     * then the list item would be equal to the predicted gas limit.
     * Else (if you have not enough balance, allowance ...) then the list item would be equal to null.
     */
    public async batchEstimatedGas(
        abi: AbiItem[],
        contractAddress: string,
        fromAddress: string,
        callsData: BatchCall[]
    ): Promise<(BigNumber | null)[]> {
        try {
            const contract = new this.web3.eth.Contract(abi, contractAddress);

            const dataList = callsData.map(callData =>
                contract.methods[callData.contractMethod](...callData.params).encodeABI()
            );

            const rpcCallsData = dataList.map((data, index) => ({
                rpcMethod: 'eth_estimateGas',
                params: {
                    from: fromAddress,
                    to: contractAddress,
                    data,
                    ...(callsData?.[index]?.value && {
                        value: `0x${parseInt(callsData?.[index]?.value!).toString(16)}`
                    })
                }
            }));

            const result = await this.rpcBatchRequest<string>(rpcCallsData);
            return result.map(value => (value ? new BigNumber(value) : null));
        } catch (e) {
            console.error(e);
            return callsData.map(() => null);
        }
    }

    /**
     * Sends batch request to rpc provider directly.
     * @see {@link https://playground.open-rpc.org/?schemaUrl=https://raw.githubusercontent.com/ethereum/eth1.0-apis/assembled-spec/openrpc.json&uiSchema%5BappBar%5D%5Bui:splitView%5D=false&uiSchema%5BappBar%5D%5Bui:input%5D=false&uiSchema%5BappBar%5D%5Bui:examplesDropdown%5D=false|EthereumJSON-RPC}
     * @param rpcCallsData Rpc methods and parameters list.
     * @returns Rpc batch request call result sorted in order of input parameters.
     */
    private async rpcBatchRequest<T extends string | string[]>(
        rpcCallsData: {
            rpcMethod: string;
            params: Object;
        }[]
    ): Promise<(T | null)[]> {
        const seed = Date.now();
        const batch = rpcCallsData.map((callData, index) => ({
            id: seed + index,
            jsonrpc: '2.0',
            method: callData.rpcMethod,
            params: [{ ...callData.params }]
        }));

        const httpClient = await this.getHttpClient();

        const response = await httpClient.post<RpcResponse<T>[]>(
            (<HttpProvider>this.web3.currentProvider).host,
            batch
        );

        return response.sort((a, b) => a.id - b.id).map(item => (item.error ? null : item.result));
    }

    /**
     * Returns httpClient if it exists or imports the axios client.
     */
    private async getHttpClient(): Promise<HttpClient> {
        if (!this.httpClient) {
            this.httpClient = await DefaultHttpClient.getInstance();
        }
        return this.httpClient;
    }

    /**
     * Gets mined transaction receipt.
     * @param hash Transaction hash
     */
    public async getTransactionReceipt(hash: string): Promise<TransactionReceipt> {
        return this.web3.eth.getTransactionReceipt(hash);
    }

    public async getTransactionStatus(hash: string): Promise<TxStatus> {
        const txReceipt = await this.getTransactionReceipt(hash);

        if (txReceipt === undefined) {
            return TxStatus.FAIL;
        }
        if (txReceipt === null) {
            return TxStatus.PENDING;
        }
        if (txReceipt.status) {
            return TxStatus.SUCCESS;
        }
        return TxStatus.FAIL;
    }

    /**
     * Calculates the average price per unit of gas according to web3.
     * @returns Average gas price in wei.
     */
    public async getGasPrice(): Promise<string> {
        return this.web3.eth.getGasPrice();
    }

    /**
     * Gets block by block id.
     * @param [blockId] Block id: hash, number ... Default is 'latest'.
     * @returns Block by blockId parameter.
     */
    public getBlock(blockId: BlockNumber | string = 'latest'): Promise<BlockTransactionString> {
        return this.web3.eth.getBlock(blockId);
    }

    public async getBlockNumber(): Promise<number> {
        return this.web3.eth.getBlockNumber();
    }

    public async getPastEvents(
        contractAddress: string,
        contractAbi: AbiItem[],
        eventName: string,
        options: {
            blocksAmount: number;
            toBlock: number | 'latest';
        }
    ): Promise<EventData[]> {
        const contract = new this.web3.eth.Contract(contractAbi, contractAddress);
        const blockNumber =
            options.toBlock === 'latest' ? await this.getBlockNumber() : options.toBlock;
        return contract.getPastEvents(eventName, {
            fromBlock: blockNumber - options.blocksAmount,
            toBlock: blockNumber
        });
    }

    /**
     * Will call smart contract method in the EVM without sending any transaction.
     * @param contractAddress Contract address.
     * @param contractAbi Contract ABI.
     * @param methodName Method name.
     * @param methodArguments Method arguments.
     * @param options Sender address and value.
     * @returns Transaction receipt.
     */
    public async staticCallContractMethod(
        contractAddress: string,
        contractAbi: AbiItem[],
        methodName: string,
        methodArguments: unknown[],
        options: { from: string; value: string }
    ): Promise<TransactionReceipt> {
        const contract = new this.web3.eth.Contract(contractAbi, contractAddress);

        return new Promise((resolve, reject) => {
            contract.methods[methodName](...methodArguments).call(
                {
                    from: options?.from,
                    ...(options?.value && { value: options.value })
                },
                (
                    error: { code: number; message: string; data: string },
                    result: TransactionReceipt | PromiseLike<TransactionReceipt>
                ) => {
                    if (result) {
                        resolve(result);
                    }

                    if (error) {
                        reject(error);
                    }
                }
            );
        });
    }
}
