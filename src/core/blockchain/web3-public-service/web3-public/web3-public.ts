import BigNumber from 'bignumber.js';
import { InsufficientFundsError, RubicSdkError } from 'src/common/errors';
import { Token } from 'src/common/tokens';
import { nativeTokensList } from 'src/common/tokens/constants/native-tokens';
import { Cache } from 'src/common/utils/decorators';
import { Web3PrimitiveType } from 'src/core/blockchain/models/web3-primitive-type';
import { BlockchainsInfo } from 'src/core/blockchain/utils/blockchains-info/blockchains-info';
import { Web3PublicSupportedBlockchain } from 'src/core/blockchain/web3-public-service/models/web3-public-storage';
import { MULTICALL_ADDRESSES } from 'src/core/blockchain/web3-public-service/web3-public/constants/multicall-addresses';
import { ContractMulticallResponse } from 'src/core/blockchain/web3-public-service/web3-public/models/contract-multicall-response';
import { MethodData } from 'src/core/blockchain/web3-public-service/web3-public/models/method-data';
import { SupportedTokenField } from 'src/core/blockchain/web3-public-service/web3-public/models/supported-token-field';
import { TxStatus } from 'src/core/blockchain/web3-public-service/web3-public/models/tx-status';
import { TronWeb3Pure } from 'src/core/blockchain/web3-pure/typed-web3-pure/tron-web3-pure/tron-web3-pure';
import { Web3Pure } from 'src/core/blockchain/web3-pure/web3-pure';
import { AbiItem } from 'web3-utils';

/**
 * Class containing methods for calling contracts in order to obtain information from the blockchain.
 * To send transaction or execute contract method use {@link Web3Private}.
 */
export abstract class Web3Public {
    protected readonly multicallAddress = MULTICALL_ADDRESSES[this.blockchainName];

    protected readonly Web3Pure = Web3Pure[BlockchainsInfo.getChainType(this.blockchainName)];

    protected abstract readonly tokenContractAbi: AbiItem[];

    protected constructor(protected readonly blockchainName: Web3PublicSupportedBlockchain) {}

    /**
     * Sets new provider to web3 instance.
     * @param provider New web3 provider, e.g. rpc link.
     */
    public abstract setProvider(provider: unknown): void;

    /**
     * Health-check current rpc node.
     * @param timeoutMs Acceptable node response timeout.
     * @returns Null if healthcheck is not defined for current blockchain, else node health status.
     */
    public abstract healthCheck(timeoutMs: number): Promise<boolean>;

    /**
     * Gets account native or token balance in wei.
     * @param userAddress Wallet address, whose balance you want to find out.
     * @param tokenAddress Address of the smart-contract corresponding to the token,
     */
    public abstract getBalance(userAddress: string, tokenAddress?: string): Promise<BigNumber>;

    /**
     * Gets token's balance in wei.
     * @param tokenAddress Address of the smart-contract corresponding to the token.
     * @param userAddress Wallet address, whose balance you want to find out.
     */
    public abstract getTokenBalance(userAddress: string, tokenAddress: string): Promise<BigNumber>;

    /**
     * Gets balances of multiple tokens via multicall.
     * @param userAddress Wallet address, which contains tokens.
     * @param tokensAddresses Tokens addresses.
     */
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

        promises[0] = this.multicallContractsMethods<string>(
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

    /**
     * Checks that user has enough balance.
     * @param userAddress Wallet address, which contains tokens.
     * @param token Token to check balance of.
     * @param requiredAmount Required user balance in Eth units.
     */
    public async checkBalance(
        token: Token,
        requiredAmount: BigNumber,
        userAddress: string
    ): Promise<void | never> {
        const balanceWei = await this.getBalance(userAddress, token.address);
        const balance = Web3Pure.fromWei(balanceWei, token.decimals);
        if (balance.lt(requiredAmount)) {
            throw new InsufficientFundsError(token, balance, requiredAmount);
        }
    }

    /**
     * Gets token info by address.
     * @param tokenAddress Address of token.
     * @param tokenFields Token's fields to get.
     */
    @Cache
    public async callForTokenInfo(
        tokenAddress: string,
        tokenFields: SupportedTokenField[] = ['decimals', 'symbol', 'name']
    ): Promise<Partial<Record<SupportedTokenField, string>>> {
        return (await this.callForTokensInfo([tokenAddress], tokenFields))[0]!;
    }

    /**
     * Gets tokens info by addresses.
     * @param tokenAddresses Addresses of tokens.
     * @param tokenFields Token's fields to get.
     */
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

        const blockchainNativeToken = nativeTokensList[this.blockchainName];
        const nativeToken = {
            ...blockchainNativeToken,
            decimals: blockchainNativeToken.decimals.toString()
        };
        tokens.splice(nativeTokenIndex, 0, nativeToken);
        return tokens;
    }

    /**
     * Calls allowance method in token contract.
     * @param tokenAddress Address of the smart-contract corresponding to the token.
     * @param spenderAddress Wallet or contract address, allowed to spend.
     * @param ownerAddress Wallet address to spend from.
     * @returns Token's amount, allowed to be spent.
     */
    public abstract getAllowance(
        tokenAddress: string,
        ownerAddress: string,
        spenderAddress: string
    ): Promise<BigNumber>;

    /**
     * Uses multicall to make several calls of one method in one contract.
     * @param contractAddress Target contract address.
     * @param contractAbi Target contract abi.
     * @param methodName Method name.
     * @param methodCallsArguments Method parameters array, for each method call.
     */
    public async multicallContractMethod<Output extends Web3PrimitiveType>(
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
    public async multicallContractMethods<Output extends Web3PrimitiveType>(
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
    public abstract multicallContractsMethods<Output extends Web3PrimitiveType>(
        contractAbi: AbiItem[],
        contractsData: {
            contractAddress: string;
            methodsData: MethodData[];
        }[]
    ): Promise<ContractMulticallResponse<Output>[][]>;

    /**
     * Calls pure method of smart-contract and returns its output value.
     * @param contractAddress Address of smart-contract which method is to be executed.
     * @param contractAbi Abi of smart-contract which method is to be executed.
     * @param methodName Called method name.
     * @param methodArguments Method arguments.
     * @param options Transaction options.
     */
    public abstract callContractMethod<T extends Web3PrimitiveType = string>(
        contractAddress: string,
        contractAbi: AbiItem[],
        methodName: string,
        methodArguments?: unknown[],
        options?: object
    ): Promise<T>;

    /**
     * Returns transaction status, based on transaction receipt.
     */
    public abstract getTransactionStatus(hash: string): Promise<TxStatus>;

    /**
     * Gets last block number.
     * @returns Block number.
     */
    public abstract getBlockNumber(): Promise<number>;
}
