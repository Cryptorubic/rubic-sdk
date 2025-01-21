import BigNumber from 'bignumber.js';
import { BigNumber as EthersBigNumber } from 'ethers';
import { RubicSdkError, TimeoutError } from 'src/common/errors';
import { nativeTokensStruct } from 'src/common/tokens/constants/native-token-struct';
import { Cache } from 'src/common/utils/decorators';
import pTimeout from 'src/common/utils/p-timeout';
import {
    HEALTHCHECK,
    isBlockchainHealthcheckAvailable
} from 'src/core/blockchain/constants/healthcheck';
import { BLOCKCHAIN_NAME } from 'src/core/blockchain/models/blockchain-name';
import { Web3PrimitiveType } from 'src/core/blockchain/models/web3-primitive-type';
import { ContractMulticallResponse } from 'src/core/blockchain/web3-public-service/web3-public/models/contract-multicall-response';
import { MethodData } from 'src/core/blockchain/web3-public-service/web3-public/models/method-data';
import { SupportedTokenField } from 'src/core/blockchain/web3-public-service/web3-public/models/supported-token-field';
import {
    TX_STATUS,
    TxStatus
} from 'src/core/blockchain/web3-public-service/web3-public/models/tx-status';
import { TRC20_CONTRACT_ABI } from 'src/core/blockchain/web3-public-service/web3-public/tron-web3-public/constants/trc-20-contract-abi';
import { TRON_MULTICALL_ABI } from 'src/core/blockchain/web3-public-service/web3-public/tron-web3-public/constants/tron-multicall-abi';
import { TronBlock } from 'src/core/blockchain/web3-public-service/web3-public/tron-web3-public/models/tron-block';
import { TronCall } from 'src/core/blockchain/web3-public-service/web3-public/tron-web3-public/models/tron-call';
import { TronMulticallResponse } from 'src/core/blockchain/web3-public-service/web3-public/tron-web3-public/models/tron-multicall-response';
import { TronWebProvider } from 'src/core/blockchain/web3-public-service/web3-public/tron-web3-public/models/tron-web-provider';
import { Web3Public } from 'src/core/blockchain/web3-public-service/web3-public/web3-public';
import { TronWeb3Pure } from 'src/core/blockchain/web3-pure/typed-web3-pure/tron-web3-pure/tron-web3-pure';
import { TronWeb } from 'tronweb';
import { ContractAbiInterface, TransactionInfo } from 'tronweb/lib/esm/types';
import { AbiItem } from 'web3-utils';

export class TronWeb3Public extends Web3Public {
    protected readonly tokenContractAbi = TRC20_CONTRACT_ABI;

    constructor(private readonly tronWeb: TronWeb) {
        super(BLOCKCHAIN_NAME.TRON);
    }

    public setProvider(_provider: TronWebProvider): void {
        throw new Error('Method not implemented.');
    }

    public async convertTronAddressToHex(address: string): Promise<string> {
        return this.tronWeb.address.toHex(address);
    }

    public async healthCheck(timeoutMs: number = 4000): Promise<boolean> {
        if (!isBlockchainHealthcheckAvailable(this.blockchainName)) {
            return true;
        }
        const healthcheckData = HEALTHCHECK[this.blockchainName];

        this.tronWeb.setAddress(healthcheckData.contractAddress);
        const contract = await this.tronWeb.contract(
            healthcheckData.contractAbi as ContractAbiInterface,
            healthcheckData.contractAddress
        );

        try {
            const result = await pTimeout(contract[healthcheckData.method]().call(), timeoutMs);
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
        if (tokenAddress && !TronWeb3Pure.isNativeAddress(tokenAddress)) {
            balance = await this.getTokenBalance(userAddress, tokenAddress);
        } else {
            this.tronWeb.setAddress(userAddress);
            balance = await this.tronWeb.trx.getBalance(userAddress);
        }
        return new BigNumber(balance);
    }

    public async getTokenBalance(userAddress: string, tokenAddress: string): Promise<BigNumber> {
        this.tronWeb.setAddress(userAddress);
        const contract = await this.tronWeb.contract(
            this.tokenContractAbi as ContractAbiInterface,
            tokenAddress
        );
        const balance: EthersBigNumber = await contract.balanceOf(userAddress).call();
        return new BigNumber(balance?.toString());
    }

    public async getAllowance(
        tokenAddress: string,
        ownerAddress: string,
        spenderAddress: string
    ): Promise<BigNumber> {
        const contract = await this.tronWeb.contract(
            this.tokenContractAbi as ContractAbiInterface,
            tokenAddress
        );

        const allowance: EthersBigNumber = await contract
            .allowance(ownerAddress, spenderAddress)
            .call();
        return new BigNumber(allowance?.toString());
    }

    public async multicallContractsMethods<Output extends Web3PrimitiveType>(
        contractAbi: AbiItem[],
        contractsData: {
            contractAddress: string;
            methodsData: MethodData[];
        }[]
    ): Promise<ContractMulticallResponse<Output>[][]> {
        const calls: TronCall[][] = contractsData.map(({ contractAddress, methodsData }) => {
            return methodsData.map(({ methodName, methodArguments }) => [
                contractAddress,
                TronWeb3Pure.encodeFunctionCall(contractAbi, methodName, methodArguments)
            ]);
        });

        try {
            const outputs = await this.multicall(calls.flat());

            let outputIndex = 0;
            return contractsData.map(contractData =>
                contractData.methodsData.map(methodData => {
                    const success = outputs.results[outputIndex]!;
                    const returnData = outputs.returnData[outputIndex]!;
                    outputIndex++;

                    const methodOutputAbi = contractAbi.find(
                        funcSignature => funcSignature.name === methodData.methodName
                    )!.outputs!;

                    return {
                        success,
                        output: success
                            ? (TronWeb3Pure.decodeMethodOutput(
                                  methodOutputAbi,
                                  returnData
                              ) as Output)
                            : null
                    };
                })
            );
        } catch {
            return this.multicallContractsMethodsByOne(contractAbi, contractsData);
        }
    }

    /**
     * Executes multiple calls in the single contract call.
     * @param calls Multicall calls data list.
     * @returns Result of calls execution.
     */
    private async multicall(calls: TronCall[]): Promise<TronMulticallResponse> {
        this.tronWeb.setAddress(this.multicallAddress);
        const contract = await this.tronWeb.contract(
            TRON_MULTICALL_ABI as ContractAbiInterface,
            this.multicallAddress
        );
        return contract.aggregateViewCalls(calls).call();
    }

    public async callContractMethod<T extends Web3PrimitiveType = string>(
        contractAddress: string,
        contractAbi: AbiItem[],
        methodName: string,
        methodArguments: unknown[] = []
    ): Promise<T> {
        this.tronWeb.setAddress(contractAddress);
        const contract = await this.tronWeb.contract(
            contractAbi as ContractAbiInterface,
            contractAddress
        );

        const response = await contract[methodName](...methodArguments).call();
        return TronWeb3Pure.flattenParameterToPrimitive(response) as T;
    }

    /**
     * Gets mined transaction info.
     * @param hash Transaction hash.
     */
    public async getTransactionInfo(hash: string): Promise<TransactionInfo> {
        return this.tronWeb.trx.getTransactionInfo(hash);
    }

    public async getTransactionStatus(hash: string): Promise<TxStatus> {
        const txReceipt = await this.getTransactionInfo(hash);

        if (txReceipt?.receipt) {
            if (txReceipt.result === 'FAILED') {
                return TX_STATUS.FAIL;
            }
            return TX_STATUS.SUCCESS;
        }
        return TX_STATUS.PENDING;
    }

    public async getBlock(): Promise<TronBlock> {
        return this.tronWeb.trx.getCurrentBlock();
    }

    public async getBlockNumber(): Promise<number> {
        return (await this.getBlock()).block_header.raw_data.number;
    }

    private multicallContractsMethodsByOne<Output extends Web3PrimitiveType>(
        contractAbi: AbiItem[],
        contractsData: {
            contractAddress: string;
            methodsData: MethodData[];
        }[]
    ): Promise<ContractMulticallResponse<Output>[][]> {
        return Promise.all(
            contractsData.map(contractData => {
                return Promise.all(
                    contractData.methodsData.map(async methodData => {
                        try {
                            const output = (await this.callContractMethod(
                                contractData.contractAddress,
                                contractAbi,
                                methodData.methodName,
                                methodData.methodArguments
                            )) as Output;
                            return {
                                success: true,
                                output
                            };
                        } catch {
                            return {
                                success: false,
                                output: null
                            };
                        }
                    })
                );
            })
        );
    }

    // @TODO Refactoring
    public async getTokensBalances(
        userAddress: string,
        tokensAddresses: string[]
    ): Promise<BigNumber[]> {
        const indexOfNativeCoin = tokensAddresses.findIndex(TronWeb3Pure.isNativeAddress);
        const promises = [];

        if (indexOfNativeCoin !== -1) {
            tokensAddresses.splice(indexOfNativeCoin, 1);
            promises[1] = this.getBalance(userAddress);
        }

        promises[0] = this.batchMulticallTokenBalance(userAddress, tokensAddresses, 10);

        const results = await Promise.all(
            promises as [Promise<ContractMulticallResponse<string>[][]>, Promise<BigNumber>]
        );
        const tokensBalances = results[0].map(tokenResults => {
            const { success, output } = tokenResults[0]!;
            return success ? new BigNumber(output!) : new BigNumber(0);
        });

        if (indexOfNativeCoin !== -1) {
            tokensBalances.splice(indexOfNativeCoin, 0, results[1]);
        }

        return tokensBalances;
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
        const contractsData = filteredTokenAddresses.map(contractAddress => ({
            contractAddress,
            methodsData: tokenFields.map(methodName => ({
                methodName,
                methodArguments: []
            }))
        }));

        const results = contractsData.length
            ? await this.multicallContractsMethods<[string]>(this.tokenContractAbi, contractsData)
            : [];
        const tokens = results.map((tokenFieldsResults, tokenIndex) => {
            const tokenAddress = tokenAddresses[tokenIndex]!;
            return tokenFieldsResults.reduce((acc, field, fieldIndex) => {
                if (!field.success) {
                    throw new RubicSdkError(`Cannot retrieve information about ${tokenAddress}`);
                }
                return {
                    ...acc,
                    [tokenFields[fieldIndex]!]: field.success ? field.output : undefined
                };
            }, {});
        });

        if (nativeTokenIndex === -1) {
            return tokens;
        }

        const blockchainNativeToken = nativeTokensStruct[this.blockchainName];
        const nativeToken = {
            ...blockchainNativeToken,
            decimals: blockchainNativeToken.decimals.toString()
        };
        tokens.splice(nativeTokenIndex, 0, nativeToken);
        return tokens;
    }

    private async batchMulticallTokenBalance(
        userAddress: string,
        tokensAddresses: string[],
        batchSize: number
    ) {
        if (tokensAddresses.length > 100) {
            const balances = [];
            for (let i = 0; i < tokensAddresses.length; i += batchSize) {
                const batchRequest = tokensAddresses.slice(i, i + batchSize);
                const batchResult = await this.multicallContractsMethods<string>(
                    this.tokenContractAbi,
                    batchRequest.map(tokenAddress => ({
                        contractAddress: tokenAddress,
                        methodsData: [
                            {
                                methodName: 'balanceOf',
                                methodArguments: [userAddress]
                            }
                        ]
                    }))
                );

                balances.push(...batchResult);
            }

            return balances;
        }

        return this.multicallContractsMethods<string>(
            this.tokenContractAbi,
            tokensAddresses.map(tokenAddress => ({
                contractAddress: tokenAddress,
                methodsData: [
                    {
                        methodName: 'balanceOf',
                        methodArguments: [userAddress]
                    }
                ]
            }))
        );
    }
}
