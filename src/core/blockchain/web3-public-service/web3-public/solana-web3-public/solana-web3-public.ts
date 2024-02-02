import { BlockhashWithExpiryBlockHeight, Connection, PublicKey } from '@solana/web3.js';
import { Client as TokenSdk } from '@solflare-wallet/utl-sdk';
import BigNumber from 'bignumber.js';
import { catchError, firstValueFrom, from, map, of, timeout } from 'rxjs';
import { nativeTokensList } from 'src/common/tokens/constants/native-tokens';
import { Cache } from 'src/common/utils/decorators';
import { NATIVE_SOLANA_MINT_ADDRESS } from 'src/core/blockchain/constants/solana/native-solana-mint-address';
import { BLOCKCHAIN_NAME } from 'src/core/blockchain/models/blockchain-name';
import { ReturnValue } from 'src/core/blockchain/models/solana-web3-types';
import { Web3PrimitiveType } from 'src/core/blockchain/models/web3-primitive-type';
import { ContractMulticallResponse } from 'src/core/blockchain/web3-public-service/web3-public/models/contract-multicall-response';
import { MethodData } from 'src/core/blockchain/web3-public-service/web3-public/models/method-data';
import { SupportedTokenField } from 'src/core/blockchain/web3-public-service/web3-public/models/supported-token-field';
import {
    TX_STATUS,
    TxStatus
} from 'src/core/blockchain/web3-public-service/web3-public/models/tx-status';
import { Web3Public } from 'src/core/blockchain/web3-public-service/web3-public/web3-public';
import { SolanaWeb3Pure } from 'src/core/blockchain/web3-pure/typed-web3-pure/non-evm-web3-pure/solana-web3-pure';
import { AbiItem } from 'web3-utils';

// @TODO SOLANA
/**
 * Class containing methods for calling contracts in order to obtain information from the blockchain.
 * To send transaction or execute contract method use {@link Web3Private}.
 */
export class SolanaWeb3Public extends Web3Public {
    constructor(private readonly connection: Connection) {
        super(BLOCKCHAIN_NAME.SOLANA);
    }

    public getBlockNumber(): Promise<number> {
        return this.connection.getBlockHeight('finalized');
    }

    public multicallContractsMethods<Output extends Web3PrimitiveType>(
        _contractAbi: AbiItem[],
        _contractsData: {
            contractAddress: string;
            methodsData: MethodData[];
        }[]
    ): Promise<ContractMulticallResponse<Output>[][]> {
        throw new Error('Method multicall is not supported');
    }

    public async getTransactionStatus(hash: string): Promise<TxStatus> {
        try {
            const transaction = await this.connection.getTransaction(hash, {
                maxSupportedTransactionVersion: 1
            });
            if (transaction?.meta?.err) {
                return TX_STATUS.FAIL;
            }
            if (transaction?.blockTime) {
                return TX_STATUS.SUCCESS;
            }
            return TX_STATUS.PENDING;
        } catch {
            return TX_STATUS.PENDING;
        }
    }

    @Cache
    public async callForTokensInfo(
        tokenAddresses: string[] | ReadonlyArray<string>,
        tokenFields: SupportedTokenField[] = ['decimals', 'symbol', 'name']
    ): Promise<Partial<Record<SupportedTokenField, string>>[]> {
        const nativeTokenIndex = tokenAddresses.findIndex(address =>
            this.Web3Pure.isNativeAddress(address)
        );
        const filteredTokenAddresses = tokenAddresses.filter(
            (_, index) => index !== nativeTokenIndex
        );

        const mints = filteredTokenAddresses.map(address => new PublicKey(address));
        const tokenSdk = new TokenSdk();
        const tokensMint = await tokenSdk.fetchMints(mints);

        const tokens = tokensMint.map(token => {
            const entries = tokenFields.map(field => [field, token?.[field]]);
            return Object.fromEntries(entries);
        });

        if (nativeTokenIndex === -1) {
            return tokens;
        }

        const blockchainNativeToken = nativeTokensList[this.blockchainName];
        const nativeToken = {
            ...blockchainNativeToken,
            decimals: blockchainNativeToken.decimals.toString()
        };
        tokens.splice(nativeTokenIndex, 0, nativeToken);
        return tokens;
    }

    public async getBalance(userAddress: string, tokenAddress: string): Promise<BigNumber> {
        const isToken = tokenAddress && !SolanaWeb3Pure.isNativeAddress(tokenAddress);
        if (isToken) {
            const balance = await this.getTokensBalances(userAddress, [tokenAddress]);
            return balance?.[0] || new BigNumber(0);
        }
        const balance = await this.connection.getBalanceAndContext(
            new PublicKey(userAddress),
            'confirmed'
        );
        return new BigNumber(balance.value.toString());
    }

    public async getTokenBalance(address: string, tokenAddress: string): Promise<BigNumber> {
        const balance = await this.getTokensBalances(address, [tokenAddress]);
        return balance?.[0] || new BigNumber(0);
    }

    public async callContractMethod<T extends Web3PrimitiveType = string>(
        _contractAddress: string,
        _contractAbi: AbiItem[],
        _methodName: string,
        _methodArguments: unknown[] = [],
        _options: {
            from?: string;
            value?: string;
            gasPrice?: string;
            gas?: string;
        } = {}
    ): Promise<T> {
        throw new Error('Method call is not supported');
    }

    public healthCheck(timeoutMs: number = 4000): Promise<boolean> {
        const request = this.connection.getBalanceAndContext(
            new PublicKey('DVLwQbEaw5txuduQwvfbNP3sXvjawHqaoMuGMKZx15bQ'),
            'confirmed'
        );
        return firstValueFrom(
            from(request).pipe(
                timeout(timeoutMs),
                map(result => Boolean(result)),
                catchError((err: unknown) => {
                    if ((err as Error)?.name === 'TimeoutError') {
                        console.debug(
                            `Solana node healthcheck timeout (${timeoutMs}ms) has occurred.`
                        );
                    } else {
                        console.debug(`Solana node healthcheck fail: ${err}`);
                    }
                    return of(false);
                })
            )
        );
    }

    /**
     * Gets balance of multiple tokens.
     * @param address Wallet address.
     * @param tokensAddresses Tokens addresses.
     */
    public async getTokensBalances(
        address: string,
        tokensAddresses: string[]
    ): Promise<BigNumber[]> {
        const resp = await (
            this.connection as Connection & {
                _rpcRequest: (owner: string, data: unknown[]) => ReturnValue;
            }
        )._rpcRequest('getTokenAccountsByOwner', [
            address,
            { programId: 'TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA' },
            { encoding: 'jsonParsed' }
        ]);

        const tokenInfo = new Map<string, number>(
            resp.result.value.map(el => {
                const { mint, tokenAmount } = el.account.data.parsed.info;
                return [mint, tokenAmount.amount];
            })
        );

        const nativeSolBalance = await this.connection.getBalanceAndContext(
            new PublicKey(address),
            'confirmed'
        );
        return tokensAddresses.map(tokenAddress => {
            if (tokenAddress === NATIVE_SOLANA_MINT_ADDRESS) {
                return new BigNumber(nativeSolBalance.value.toString());
            }
            const tokenWithBalance = tokenInfo.get(tokenAddress);
            return new BigNumber(tokenWithBalance || NaN);
        });
    }

    public async getAllowance(): Promise<BigNumber> {
        return new BigNumber(Infinity);
    }

    // public get web3Provider(): Web3 {
    //     return this.web3;
    // }
    //

    public setProvider(_provider: unknown): void {
        return;
    }

    // public async healthCheck(timeoutMs: number = 4000): Promise<boolean> {
    //     if (!isBlockchainHealthcheckAvailable(this.blockchainName)) {
    //         return true;
    //     }
    //     const healthcheckData = HEALTHCHECK[this.blockchainName];
    //
    //     const contract = new this.web3.eth.Contract(
    //         healthcheckData.contractAbi,
    //         healthcheckData.contractAddress
    //     );
    //
    //     try {
    //         const result = await pTimeout(
    //             contract.methods[healthcheckData.method]().call(),
    //             timeoutMs
    //         );
    //         return result === healthcheckData.expected;
    //     } catch (e: unknown) {
    //         if (e instanceof TimeoutError) {
    //             console.debug(
    //                 `${this.blockchainName} node healthcheck timeout (${timeoutMs}ms) has occurred.`
    //             );
    //         } else {
    //             console.debug(`${this.blockchainName} node healthcheck fail: ${e}`);
    //         }
    //         return false;
    //     }
    // }
    //
    // public async getBalance(userAddress: string, tokenAddress?: string): Promise<BigNumber> {
    //     const isToken = tokenAddress && !EvmWeb3Pure.isNativeAddress(tokenAddress);
    //     const balance = isToken
    //         ? await this.getTokenBalance(userAddress, tokenAddress)
    //         : await this.web3.eth.getBalance(userAddress);
    //     return new BigNumber(balance);
    // }
    //
    // public async getTokenBalance(userAddress: string, tokenAddress: string): Promise<BigNumber> {
    //     const contract = new this.web3.eth.Contract(this.tokenContractAbi, tokenAddress);
    //
    //     const balance = await contract.methods.balanceOf(userAddress).call();
    //     return new BigNumber(balance);
    // }
    //
    // public async getAllowance(
    //     tokenAddress: string,
    //     ownerAddress: string,
    //     spenderAddress: string
    // ): Promise<BigNumber> {
    //     try {
    //         const contract = new this.web3.eth.Contract(this.tokenContractAbi, tokenAddress);
    //
    //         const allowance = await contract.methods.allowance(ownerAddress, spenderAddress).call();
    //         return new BigNumber(allowance);
    //     } catch (err) {
    //         console.error(err);
    //         return new BigNumber(0);
    //     }
    // }
    //
    // public async multicallContractsMethods<Output extends Web3PrimitiveType>(
    //     contractAbi: AbiItem[],
    //     contractsData: {
    //         contractAddress: string;
    //         methodsData: MethodData[];
    //     }[]
    // ): Promise<ContractMulticallResponse<Output>[][]> {
    //     if (this.multicallAddress) {
    //         try {
    //             const calls: EvmCall[][] = contractsData.map(({ contractAddress, methodsData }) => {
    //                 const contract = new this.web3.eth.Contract(contractAbi, contractAddress);
    //                 return methodsData.map(({ methodName, methodArguments }) => ({
    //                     callData: contract.methods[methodName](...methodArguments).encodeABI(),
    //                     target: contractAddress
    //                 }));
    //             });
    //
    //             const outputs = await this.multicall(calls.flat());
    //
    //             let outputIndex = 0;
    //             return contractsData.map(contractData =>
    //                 contractData.methodsData.map(methodData => {
    //                     const methodOutputAbi = contractAbi.find(
    //                         funcSignature => funcSignature.name === methodData.methodName
    //                     )!.outputs!;
    //                     const output = outputs[outputIndex];
    //                     if (!output) {
    //                         throw new RubicSdkError('Output has to be defined');
    //                     }
    //
    //                     outputIndex++;
    //
    //                     return {
    //                         success: output.success,
    //                         output:
    //                             output.success && output.returnData.length > 2
    //                                 ? (this.web3.eth.abi.decodeParameters(
    //                                       methodOutputAbi,
    //                                       output.returnData
    //                                   )[0] as Output)
    //                                 : null
    //                     };
    //                 })
    //             );
    //         } catch (err: unknown) {
    //             if (err instanceof Error) {
    //                 if (err.message.includes('unsigned transaction')) {
    //                     return this.multicallContractsMethodsByOne(contractAbi, contractsData);
    //                 }
    //             }
    //             throw err;
    //         }
    //     }
    //
    //     return this.multicallContractsMethodsByOne(contractAbi, contractsData);
    // }
    //
    // /**
    //  * Executes multiple calls in the single contract call.
    //  * @param calls Multicall calls data list.
    //  * @returns Result of calls execution.
    //  */
    // private async multicall(calls: EvmCall[]): Promise<EvmMulticallResponse[]> {
    //     const contract = new this.web3.eth.Contract(EVM_MULTICALL_ABI, this.multicallAddress);
    //     return contract.methods.tryAggregate(false, calls).call();
    // }
    //
    // private multicallContractsMethodsByOne<Output extends Web3PrimitiveType>(
    //     contractAbi: AbiItem[],
    //     contractsData: {
    //         contractAddress: string;
    //         methodsData: MethodData[];
    //     }[]
    // ): Promise<ContractMulticallResponse<Output>[][]> {
    //     return Promise.all(
    //         contractsData.map(contractData => {
    //             const contract = new this.web3.eth.Contract(
    //                 contractAbi,
    //                 contractData.contractAddress
    //             );
    //             return Promise.all(
    //                 contractData.methodsData.map(async methodData => {
    //                     try {
    //                         const output = (await contract.methods[methodData.methodName](
    //                             ...methodData.methodArguments
    //                         ).call()) as Output;
    //                         return {
    //                             success: true,
    //                             output
    //                         };
    //                     } catch {
    //                         return {
    //                             success: false,
    //                             output: null
    //                         };
    //                     }
    //                 })
    //             );
    //         })
    //     );
    // }
    //
    // public async callContractMethod<T extends Web3PrimitiveType = string>(
    //     contractAddress: string,
    //     contractAbi: AbiItem[],
    //     methodName: string,
    //     methodArguments: unknown[] = [],
    //     options: {
    //         from?: string;
    //         value?: string;
    //         gasPrice?: string;
    //         gas?: string;
    //     } = {}
    // ): Promise<T> {
    //     const contract = new this.web3.eth.Contract(contractAbi, contractAddress);
    //     const callableContract = contract.methods[methodName](...methodArguments);
    //     return callableContract.call({
    //         ...(options.from && { from: options.from }),
    //         ...(options.value && { value: options.value }),
    //         ...(options.gasPrice && { value: options.gasPrice }),
    //         ...(options.gas && { value: options.gas })
    //     });
    // }
    //
    // /**
    //  * Predicts the volume of gas required to execute the contract method.
    //  * @param contractAbi Abi of smart-contract.
    //  * @param contractAddress Address of smart-contract.
    //  * @param methodName Method which execution gas limit is to be calculated.
    //  * @param methodArguments Arguments of the contract method.
    //  * @param fromAddress The address for which the gas calculation will be called.
    //  * @param value The value transferred for the call “transaction” in wei.
    //  * @returns Estimated gas limit.
    //  */
    // public async getEstimatedGas(
    //     contractAbi: AbiItem[],
    //     contractAddress: string,
    //     methodName: string,
    //     methodArguments: unknown[],
    //     fromAddress: string,
    //     value?: string | BigNumber
    // ): Promise<BigNumber | null> {
    //     const contract = new this.web3.eth.Contract(contractAbi, contractAddress);
    //
    //     try {
    //         const gasLimit = await contract.methods[methodName](...methodArguments).estimateGas({
    //             from: fromAddress,
    //             ...(value && { value })
    //         });
    //         return new BigNumber(gasLimit);
    //     } catch (err) {
    //         console.debug(err);
    //         return null;
    //     }
    // }
    //
    // public async getEstimatedGasByData(
    //     fromAddress: string,
    //     toAddress: string,
    //     options: {
    //         from?: string;
    //         value?: string;
    //         gasPrice?: string;
    //         gas?: string;
    //         data: string;
    //     }
    // ): Promise<BigNumber | null> {
    //     try {
    //         const gasLimit = await this.web3.eth.estimateGas({
    //             from: fromAddress,
    //             to: toAddress,
    //             value: Web3Private.stringifyAmount(options.value || 0),
    //             ...(options.gas && { gas: Web3Private.stringifyAmount(options.gas) }),
    //             ...(options.data && { data: options.data })
    //         });
    //         return new BigNumber(gasLimit);
    //     } catch (err) {
    //         console.debug(err);
    //         return null;
    //     }
    // }
    //
    // /**
    //  * Get estimated gas of several contract method executions via rpc batch request.
    //  * @param fromAddress Sender address.
    //  * @param callsData Transactions parameters.
    //  * @returns List of contract execution estimated gases.
    //  * If the execution of the method in the real blockchain would not be reverted,
    //  * then the list item would be equal to the predicted gas limit.
    //  * Else (if you have not enough balance, allowance ...) then the list item would be equal to null.
    //  */
    // public async batchEstimatedGas(
    //     fromAddress: string,
    //     callsData: BatchCall[]
    // ): Promise<(BigNumber | null)[]> {
    //     try {
    //         const rpcCallsData = callsData.map(callData => ({
    //             rpcMethod: 'eth_estimateGas',
    //             params: {
    //                 from: fromAddress,
    //                 to: callData.to,
    //                 data: callData.data,
    //                 ...(callData.value && {
    //                     value: `0x${parseInt(callData.value).toString(16)}`
    //                 })
    //             }
    //         }));
    //
    //         const result = await this.rpcBatchRequest<string>(rpcCallsData);
    //         return result.map(value => (value ? new BigNumber(value) : null));
    //     } catch (e) {
    //         console.error(e);
    //         return callsData.map(() => null);
    //     }
    // }
    //
    // /**
    //  * Sends batch request to rpc provider directly.
    //  * @see {@link https://playground.open-rpc.org/?schemaUrl=https://raw.githubusercontent.com/ethereum/eth1.0-apis/assembled-spec/openrpc.json&uiSchema%5BappBar%5D%5Bui:splitView%5D=false&uiSchema%5BappBar%5D%5Bui:input%5D=false&uiSchema%5BappBar%5D%5Bui:examplesDropdown%5D=false|EthereumJSON-RPC}
    //  * @param rpcCallsData Rpc methods and parameters list.
    //  * @returns Rpc batch request call result sorted in order of input parameters.
    //  */
    // private async rpcBatchRequest<T extends string | string[]>(
    //     rpcCallsData: {
    //         rpcMethod: string;
    //         params: Object;
    //     }[]
    // ): Promise<(T | null)[]> {
    //     const seed = Date.now();
    //     const batch = rpcCallsData.map((callData, index) => ({
    //         id: seed + index,
    //         jsonrpc: '2.0',
    //         method: callData.rpcMethod,
    //         params: [{ ...callData.params }]
    //     }));
    //
    //     const httpClient = await this.getHttpClient();
    //
    //     const response = await httpClient.post<RpcResponse<T>[]>(
    //         (<HttpProvider>this.web3.currentProvider).host,
    //         batch
    //     );
    //
    //     return response.sort((a, b) => a.id - b.id).map(item => (item.error ? null : item.result));
    // }
    //
    // /**
    //  * Returns httpClient if it exists or imports the axios client.
    //  */
    // private async getHttpClient(): Promise<HttpClient> {
    //     if (!this.httpClient) {
    //         this.httpClient = await DefaultHttpClient.getInstance();
    //     }
    //     return this.httpClient;
    // }
    //
    // /**
    //  * Gets mined transaction receipt.
    //  * @param hash Transaction hash
    //  */
    // public async getTransactionReceipt(hash: string): Promise<TransactionReceipt> {
    //     return this.web3.eth.getTransactionReceipt(hash);
    // }
    //
    // public async getTransactionStatus(hash: string): Promise<TxStatus> {
    //     const txReceipt = await this.getTransactionReceipt(hash);
    //
    //     if (txReceipt === null) {
    //         return TX_STATUS.PENDING;
    //     }
    //     if (txReceipt.status) {
    //         return TX_STATUS.SUCCESS;
    //     }
    //     return TX_STATUS.FAIL;
    // }
    //
    // /**
    //  * Calculates the average price per unit of gas according to web3.
    //  * @returns Average gas price in wei.
    //  */
    // public async getGasPrice(): Promise<string> {
    //     return this.web3.eth.getGasPrice();
    // }
    //
    // /**
    //  * Estimates average maxPriorityFeePerGas for EIP-1559 transactions based on last 20 blocks.
    //  * @see {@link https://docs.alchemy.com/docs/how-to-build-a-gas-fee-estimator-using-eip-1559}
    //  * @returns Average maxPriorityFeePerGas in wei
    //  */
    // public async getMaxPriorityFeePerGas(): Promise<number> {
    //     const HISTORICAL_BLOCKS = 20;
    //
    //     const feeHistory = await this.web3.eth.getFeeHistory(HISTORICAL_BLOCKS, 'pending', [50]);
    //     const blocks = feeHistory.reward.map(x => x.map(reward => Number(reward)));
    //
    //     const rewardSum = blocks
    //         .map(x => x[0])
    //         .reduce((acc: number, v: number | undefined) => acc + (v || 0), 0);
    //
    //     return Math.round(rewardSum / blocks.length);
    // }
    //
    // /**
    //  * Calculates EIP-1559 specific gas details.
    //  * @see {@link https://github.com/ethers-io/ethers.js/blob/master/packages/abstract-provider/src.ts/index.ts#L235}
    //  * @returns block baseFee, average maxPriorityFeePerGas, and maxFeePerGas.
    //  */
    // public async getPriorityFeeGas(): Promise<GasPrice> {
    //     const block = await this.getBlock('latest');
    //
    //     let lastBaseFeePerGas = null;
    //     let maxFeePerGas = null;
    //     let maxPriorityFeePerGas = null;
    //
    //     if (block && block.baseFeePerGas) {
    //         try {
    //             lastBaseFeePerGas = this.getBaseFee(block);
    //             maxPriorityFeePerGas = await this.getMaxPriorityFeePerGas();
    //             maxFeePerGas = block.baseFeePerGas * 2 + maxPriorityFeePerGas;
    //         } catch (err) {
    //             console.debug(err);
    //         }
    //     }
    //
    //     return {
    //         baseFee: lastBaseFeePerGas?.toFixed(),
    //         maxFeePerGas: maxFeePerGas?.toFixed(),
    //         maxPriorityFeePerGas: maxPriorityFeePerGas?.toFixed()
    //     };
    // }
    //
    // /**
    //  * Calculates base fee for a given block, based on EIP-1559 base fee formula
    //  * @see {@link https://eips.ethereum.org/EIPS/eip-1559}
    //  * @param block Block details
    //  * @returns Base fee for a given block
    //  */
    // private getBaseFee(block: BlockTransactionString): number | null {
    //     if (!block.baseFeePerGas) return null;
    //
    //     const BASE_FEE_MAX_CHANGE_DENOMINATOR = 8;
    //
    //     const parentGasUsed = block.gasUsed;
    //     const parentGasTarget = block.gasLimit;
    //     const parentBaseFeePerGas = block.baseFeePerGas;
    //
    //     let lastBaseFeePerGas = null;
    //
    //     if (parentGasUsed === parentGasTarget) {
    //         lastBaseFeePerGas = block.baseFeePerGas;
    //     } else if (parentGasUsed > parentGasTarget) {
    //         const gasUsedDelta = parentGasUsed - parentGasTarget;
    //         const baseFeePerGasDelta = Math.max(
    //             (parentBaseFeePerGas * gasUsedDelta) /
    //                 parentGasTarget /
    //                 BASE_FEE_MAX_CHANGE_DENOMINATOR,
    //             1
    //         );
    //         lastBaseFeePerGas = parentBaseFeePerGas + baseFeePerGasDelta;
    //     } else {
    //         const gasUsedDelta = parentGasTarget - parentGasUsed;
    //         const baseFeePerGasDelta =
    //             (parentBaseFeePerGas * gasUsedDelta) /
    //             parentGasTarget /
    //             BASE_FEE_MAX_CHANGE_DENOMINATOR;
    //         lastBaseFeePerGas = parentBaseFeePerGas - baseFeePerGasDelta;
    //     }
    //
    //     return lastBaseFeePerGas;
    // }
    //
    // /**
    //  * Gets block by block id.
    //  * @param [blockId] Block id: hash, number ... Default is 'latest'.
    //  * @returns Block by blockId parameter.
    //  */
    // public getBlock(blockId: BlockNumber | string = 'latest'): Promise<BlockTransactionString> {
    //     return this.web3.eth.getBlock(blockId);
    // }
    //
    // public async getBlockNumber(): Promise<number> {
    //     return this.web3.eth.getBlockNumber();
    // }
    //
    // public async getPastEvents(
    //     contractAddress: string,
    //     contractAbi: AbiItem[],
    //     eventName: string,
    //     options: {
    //         blocksAmount: number;
    //         toBlock: number | 'latest';
    //     }
    // ): Promise<EventData[]> {
    //     const contract = new this.web3.eth.Contract(contractAbi, contractAddress);
    //     const blockNumber =
    //         options.toBlock === 'latest' ? await this.getBlockNumber() : options.toBlock;
    //     return contract.getPastEvents(eventName, {
    //         fromBlock: blockNumber - options.blocksAmount,
    //         toBlock: blockNumber
    //     });
    // }
    //
    // /**
    //  * Will call smart contract method in the EVM without sending any transaction.
    //  * @param contractAddress Contract address.
    //  * @param contractAbi Contract ABI.
    //  * @param methodName Method name.
    //  * @param methodArguments Method arguments.
    //  * @param options Sender address and value.
    //  * @returns Transaction receipt.
    //  */
    // public async staticCallContractMethod(
    //     contractAddress: string,
    //     contractAbi: AbiItem[],
    //     methodName: string,
    //     methodArguments: unknown[],
    //     options: { from: string; value: string }
    // ): Promise<TransactionReceipt> {
    //     const contract = new this.web3.eth.Contract(contractAbi, contractAddress);
    //
    //     return new Promise((resolve, reject) => {
    //         contract.methods[methodName](...methodArguments).call(
    //             {
    //                 from: options?.from,
    //                 ...(options?.value && { value: options.value })
    //             },
    //             (
    //                 error: { code: number; message: string; data: string },
    //                 result: TransactionReceipt | PromiseLike<TransactionReceipt>
    //             ) => {
    //                 if (result) {
    //                     resolve(result);
    //                 }
    //
    //                 if (error) {
    //                     reject(error);
    //                 }
    //             }
    //         );
    //     });
    // }

    public async getRecentBlockhash(): Promise<BlockhashWithExpiryBlockHeight> {
        return this.connection.getLatestBlockhash();
    }
}
