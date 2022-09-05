import { Cache } from '@rsdk-common/decorators/cache.decorator';
import { ConditionalResult } from '@rsdk-common/decorators/models/conditional-result';
import { HealthcheckError } from '@rsdk-common/errors/blockchain/healthcheck.error';
import { TimeoutError } from '@rsdk-common/errors/utils/timeout.error';
import pTimeout from '@rsdk-common/utils/p-timeout';
import { ERC20_TOKEN_ABI } from '@rsdk-core/blockchain/constants/erc-20-abi';
import {
    HEALTHCHECK,
    isBlockchainHealthcheckAvailable
} from '@rsdk-core/blockchain/constants/healthcheck';
import { nativeTokensList } from '@rsdk-core/blockchain/constants/native-tokens';
import { BlockchainName } from '@rsdk-core/blockchain/models/blockchain-name';
import { MULTICALL_ABI } from '@rsdk-core/blockchain/web3-public/constants/multicall-abi';
import { MULTICALL_ADDRESSES } from '@rsdk-core/blockchain/web3-public/constants/multicall-addresses';
import { BatchCall } from '@rsdk-core/blockchain/web3-public/models/batch-call';
import { Call } from '@rsdk-core/blockchain/web3-public/models/call';
import { ContractMulticallResponse } from '@rsdk-core/blockchain/web3-public/models/contract-multicall-response';
import { MulticallResponse } from '@rsdk-core/blockchain/web3-public/models/multicall-response';
import { RpcResponse } from '@rsdk-core/blockchain/web3-public/models/rpc-response';
import { Web3Pure } from '@rsdk-core/blockchain/web3-pure/web3-pure';
import Web3 from 'web3';
import BigNumber from 'bignumber.js';
import { Transaction, provider as Provider, BlockNumber, HttpProvider } from 'web3-core';
import { AbiItem } from 'web3-utils';
import { BlockTransactionString, TransactionReceipt } from 'web3-eth';
import { InsufficientFundsError } from '@rsdk-common/errors/swap/insufficient-funds.error';
import { HttpClient } from '@rsdk-common/models/http-client';
import { DefaultHttpClient } from '@rsdk-common/http/default-http-client';
import { MethodData } from '@rsdk-core/blockchain/web3-public/models/method-data';
import { RubicSdkError } from 'src/common';
import { EventData } from 'web3-eth-contract';

type SupportedTokenField = 'decimals' | 'symbol' | 'name' | 'totalSupply';

/**
 * Class containing methods for calling contracts in order to obtain information from the blockchain.
 * To send transaction or execute contract method use {@link Web3Private}.
 */
export class Web3Public {
    private readonly multicallAddresses: Record<BlockchainName, string> = MULTICALL_ADDRESSES;

    /**
     * @param web3 Web3 instance initialized with ethereum provider, e.g. rpc link.
     * @param blockchainName Blockchain in which you need to execute requests.
     * @param [httpClient=axios] Http client that implements {@link HttpClient} interface.
     */
    constructor(
        private readonly web3: Web3,
        private readonly blockchainName: BlockchainName,
        private httpClient?: HttpClient
    ) {}

    /**
     * Health-check current rpc node.
     * @param timeoutMs Acceptable node response timeout.
     * @returns Null if healthcheck is not defined for current blockchain, else node health status.
     */
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

            if (result !== healthcheckData.expected) {
                throw new HealthcheckError();
            }
            return true;
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

    /**
     * Sets new provider to web3 instance.
     * @param provider New web3 provider, e.g. rpc link.
     */
    public setProvider(provider: Provider): void {
        this.web3.setProvider(provider);
    }

    /**
     * Gets block by block id.
     * @param [blockId] Block id: hash, number ... Default is 'latest'.
     * @returns Block by blockId parameter.
     */
    public getBlock(blockId: BlockNumber | string = 'latest'): Promise<BlockTransactionString> {
        return this.web3.eth.getBlock(blockId);
    }

    /**
     * Gets last block number.
     * @returns Block number.
     */
    public async getBlockNumber(): Promise<number> {
        return this.web3.eth.getBlockNumber();
    }

    /**
     * Gets account native or ERC-20 token balance in wei.
     * @param address Wallet address, whose balance you want to find out.
     * @param tokenAddress Address of the smart-contract corresponding to the token,
     * {@link NATIVE_TOKEN_ADDRESS} is used as default.
     */
    public async getBalance(address: string, tokenAddress?: string): Promise<BigNumber> {
        let balance;
        if (tokenAddress && !Web3Pure.isNativeAddress(tokenAddress)) {
            balance = await this.getTokenBalance(address, tokenAddress);
        } else {
            balance = await this.web3.eth.getBalance(address);
        }
        return new BigNumber(balance);
    }

    /**
     * Gets ERC-20 tokens balance in wei.
     * @param tokenAddress Address of the smart-contract corresponding to the token.
     * @param address Wallet address, whose balance you want to find out.
     */
    public async getTokenBalance(address: string, tokenAddress: string): Promise<BigNumber> {
        const contract = new this.web3.eth.Contract(ERC20_TOKEN_ABI as AbiItem[], tokenAddress);

        const balance = await contract.methods.balanceOf(address).call();
        return new BigNumber(balance);
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
     * Calculates the average price per unit of gas according to web3.
     * @returns Average gas price in wei.
     */
    public async getGasPrice(): Promise<string> {
        return this.web3.eth.getGasPrice();
    }

    /**
     * Calculates the average price per unit of gas according to web3.
     * @returns Average gas price with decimals.
     */
    public async getGasPriceInETH(): Promise<BigNumber> {
        const gasPrice = await this.web3.eth.getGasPrice();
        return new BigNumber(gasPrice).div(10 ** 18);
    }

    /**
     * Calls allowance method in ERC-20 token contract.
     * @param tokenAddress Address of the smart-contract corresponding to the token.
     * @param spenderAddress Wallet or contract address, allowed to spend.
     * @param ownerAddress Wallet address to spend from.
     * @returns Token's amount, allowed to be spent.
     */
    public async getAllowance(
        tokenAddress: string,
        ownerAddress: string,
        spenderAddress: string
    ): Promise<BigNumber> {
        const contract = new this.web3.eth.Contract(ERC20_TOKEN_ABI, tokenAddress);

        const allowance = await contract.methods
            .allowance(ownerAddress, spenderAddress)
            .call({ from: ownerAddress });
        return new BigNumber(allowance);
    }

    /**
     * Gets mined transaction
     * @param hash transaction hash
     */
    public async getTransactionReceipt(hash: string): Promise<TransactionReceipt> {
        return this.web3.eth.getTransactionReceipt(hash);
    }

    /**
     * Gets a transaction by hash in several attempts.
     * @param hash Hash of the target transaction.
     * @param attempt Current attempt number.
     * @param attemptsLimit Maximum allowed number of attempts.
     * @param delay Delay before next attempt in ms.
     */
    public async getTransactionByHash(
        hash: string,
        attempt?: number,
        attemptsLimit?: number,
        delay?: number
    ): Promise<Transaction | null> {
        attempt = attempt || 0;
        const limit = attemptsLimit || 10;
        const timeoutMs = delay || 500;

        if (attempt >= limit) {
            return null;
        }

        const transaction = await this.web3.eth.getTransaction(hash);
        if (transaction === null) {
            return new Promise(resolve =>
                setTimeout(() => resolve(this.getTransactionByHash(hash, attempt!! + 1)), timeoutMs)
            );
        }
        return transaction;
    }

    /**
     * Calls pure method of smart-contract and returns its output value.
     * @param contractAddress Address of smart-contract which method is to be executed.
     * @param contractAbi Abi of smart-contract which method is to be executed.
     * @param methodName Called method name.
     * @param [options] Additional options.
     * @param [options.from] The address the call should be made from.
     * @param [options.methodArguments] Method arguments.
     * @param [options.value] Native token amount to be passed.
     */
    public async callContractMethod<T = string>(
        contractAddress: string,
        contractAbi: AbiItem[],
        methodName: string,
        options: {
            methodArguments?: unknown[];
            from?: string;
            value?: string;
        } = { methodArguments: [] }
    ): Promise<T> {
        const contract = new this.web3.eth.Contract(contractAbi, contractAddress);

        return contract.methods[methodName](...options.methodArguments!!).call({
            ...(options.from && { from: options.from }),
            ...(options.value && { value: options.value })
        });
    }

    /**
     * Gets balances of multiple tokens via multicall.
     * @param address Wallet address, which contains tokens.
     * @param tokensAddresses Tokens addresses.
     */
    public async getTokensBalances(
        address: string,
        tokensAddresses: string[]
    ): Promise<BigNumber[]> {
        const contract = new this.web3.eth.Contract(
            ERC20_TOKEN_ABI as AbiItem[],
            tokensAddresses[0]
        );
        const indexOfNativeCoin = tokensAddresses.findIndex(Web3Pure.isNativeAddress);
        const promises: [Promise<MulticallResponse[]>?, Promise<BigNumber>?] = [];

        if (indexOfNativeCoin !== -1) {
            tokensAddresses.splice(indexOfNativeCoin, 1);
            promises[1] = this.getBalance(address);
        }
        const calls: Call[] = tokensAddresses.map(tokenAddress => ({
            target: tokenAddress,
            callData: contract.methods.balanceOf(address).encodeABI()
        }));
        promises[0] = this.multicall(calls);

        const results = await Promise.all(
            promises as [Promise<MulticallResponse[]>, Promise<BigNumber>]
        );
        const tokensBalances = results[0].map(({ success, returnData }) =>
            success ? new BigNumber(returnData) : new BigNumber(0)
        );

        if (indexOfNativeCoin !== -1) {
            tokensBalances.splice(indexOfNativeCoin, 0, results[1]);
        }

        return tokensBalances;
    }

    /**
     * Uses multicall to make several calls of one method in one contract.
     * @param contractAddress Target contract address.
     * @param contractAbi Target contract abi.
     * @param methodName Method name.
     * @param methodCallsArguments Method parameters array, for each method call.
     */
    public async multicallContractMethod<Output>(
        contractAddress: string,
        contractAbi: AbiItem[],
        methodName: string,
        methodCallsArguments: unknown[][]
    ): Promise<ContractMulticallResponse<Output>[]> {
        return this.multicallContractMethods<Output>(
            contractAddress,
            contractAbi,
            methodCallsArguments.map(methodArguments => ({
                methodName,
                methodArguments
            }))
        );
    }

    /**
     * Uses multicall to make several methods calls in one contract.
     * @param contractAddress Target contract address.
     * @param contractAbi Target contract abi.
     * @param methodsData Methods data, containing methods' names and arguments.
     */
    public async multicallContractMethods<Output>(
        contractAddress: string,
        contractAbi: AbiItem[],
        methodsData: MethodData[]
    ): Promise<ContractMulticallResponse<Output>[]> {
        const results = await this.multicallContractsMethods<Output>(contractAbi, [
            {
                contractAddress,
                methodsData
            }
        ]);
        if (!results?.[0]) {
            throw new RubicSdkError('Cant perform multicall or request data is empty');
        }
        return results[0];
    }

    /**
     * Uses multicall to make many methods calls in several contracts.
     * @param contractAbi Target contract abi.
     * @param contractsData Contract addresses and methods data, containing methods' names and arguments.
     */
    public async multicallContractsMethods<Output>(
        contractAbi: AbiItem[],
        contractsData: {
            contractAddress: string;
            methodsData: MethodData[];
        }[]
    ): Promise<ContractMulticallResponse<Output>[][]> {
        const calls: Call[][] = contractsData.map(({ contractAddress, methodsData }) => {
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
                    output: output.success
                        ? (this.web3.eth.abi.decodeParameters(
                              methodOutputAbi,
                              output.returnData
                          ) as Output)
                        : null
                };
            })
        );
    }

    /**
     * Checks if the specified address contains the required amount of these tokens.
     * Throws an InsufficientFundsError if balance is insufficient.
     * @param token Token, which balance you need to check.
     * @param amount Required balance.
     * @param userAddress The address, where the required balance should be.
     */
    public async checkBalance(
        token: { address: string; symbol: string; decimals: number },
        amount: BigNumber,
        userAddress: string
    ): Promise<void> {
        let balance: BigNumber;
        if (Web3Pure.isNativeAddress(token.address)) {
            balance = await this.getBalance(userAddress);
        } else {
            balance = await this.getTokenBalance(userAddress, token.address);
        }

        const amountAbsolute = Web3Pure.toWei(amount, token.decimals);
        if (balance.lt(amountAbsolute)) {
            throw new InsufficientFundsError(token.symbol, balance.toString(), amountAbsolute);
        }
    }

    /**
     * Gets ERC-20 token info by address.
     * @param tokenAddress Address of token.
     * @param tokenFields Token's fields to get.
     */
    @Cache
    public async callForTokenInfo(
        tokenAddress: string,
        tokenFields: SupportedTokenField[] = ['decimals', 'symbol', 'name']
    ): Promise<Partial<Record<SupportedTokenField, string>>> {
        if (Web3Pure.isNativeAddress(tokenAddress)) {
            const nativeToken = nativeTokensList[this.blockchainName];
            return { ...nativeToken, decimals: nativeToken.decimals.toString() };
        }
        const tokenFieldsPromises = tokenFields.map(method =>
            this.callContractMethod(tokenAddress, ERC20_TOKEN_ABI, method)
        );
        const tokenFieldsResults = await Promise.all(tokenFieldsPromises);
        return tokenFieldsResults.reduce((acc, field, index) => {
            const fieldName = tokenFields[index];
            if (!fieldName) {
                throw new RubicSdkError('Field name has to be defined');
            }
            return { ...acc, [fieldName]: field };
        }, {} as Record<SupportedTokenField, string>);
    }

    /**
     * Gets ERC-20 tokens info by addresses.
     * @param tokenAddresses Addresses of tokens.
     */
    @Cache({ conditionalCache: true })
    public async callForTokensInfo(
        tokenAddresses: string[] | ReadonlyArray<string>
    ): Promise<Record<SupportedTokenField, string | undefined>[]> {
        const tokenFields = ['decimals', 'symbol', 'name'] as const;
        const contractsData = tokenAddresses.map(contractAddress => ({
            contractAddress,
            methodsData: tokenFields.map(methodName => ({
                methodName,
                methodArguments: []
            }))
        }));

        const results = await this.multicallContractsMethods<[string]>(
            ERC20_TOKEN_ABI,
            contractsData
        );
        let notSave = false;
        const tokensInfo = results.map(contractCallResult => {
            const token = {} as Record<SupportedTokenField, string | undefined>;
            contractCallResult.forEach((field, index) => {
                token[tokenFields[index] as SupportedTokenField] = field.success
                    ? field.output?.[0]
                    : undefined;
                if (!field.success) {
                    notSave = true;
                }
            });
            return token;
        });

        const conditionalReturns: ConditionalResult<
            Record<SupportedTokenField, string | undefined>[]
        > = {
            notSave,
            value: tokensInfo
        };

        // see https://github.com/microsoft/TypeScript/issues/4881
        // @ts-ignore
        return conditionalReturns;
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
     * Executes multiple calls in the single contract call.
     * @param calls Multicall calls data list.
     * @returns Result of calls execution.
     */
    private async multicall(calls: Call[]): Promise<MulticallResponse[]> {
        const contract = new this.web3.eth.Contract(
            MULTICALL_ABI,
            this.multicallAddresses[this.blockchainName]
        );
        return contract.methods.tryAggregate(false, calls).call();
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
}
