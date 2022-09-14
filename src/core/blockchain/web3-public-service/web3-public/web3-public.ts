import BigNumber from 'bignumber.js';
import { MULTICALL_ADDRESSES } from 'src/core/blockchain/web3-public-service/web3-public/constants/multicall-addresses';
import { BlockchainName } from 'src/core/blockchain/models/blockchain-name';
import { SupportedTokenField } from 'src/core/blockchain/web3-public-service/web3-public/models/supported-token-field';
import { AbiItem } from 'web3-utils';
import { ContractMulticallResponse } from 'src/core/blockchain/web3-public-service/web3-public/models/contract-multicall-response';
import { MethodData } from 'src/core/blockchain/web3-public-service/web3-public/models/method-data';
import { RubicSdkError } from 'src/common/errors';
import { Cache } from 'src/common/utils/decorators';
import { nativeTokensList } from 'src/common/tokens/constants/native-tokens';
import { Web3Pure } from 'src/core/blockchain/web3-pure/web3-pure';
import { BlockchainsInfo } from 'src/core/blockchain/utils/blockchains-info/blockchains-info';

/**
 * Class containing methods for calling contracts in order to obtain information from the blockchain.
 * To send transaction or execute contract method use {@link Web3Private}.
 */
export abstract class Web3Public<T extends BlockchainName = BlockchainName> {
    protected readonly multicallAddress = MULTICALL_ADDRESSES[this.blockchainName];

    protected readonly Web3Pure = Web3Pure[BlockchainsInfo.getChainType(this.blockchainName)];

    protected abstract readonly tokenContractAbi: AbiItem[];

    protected constructor(protected readonly blockchainName: T) {}

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
     * @param address Wallet address, whose balance you want to find out.
     * @param tokenAddress Address of the smart-contract corresponding to the token,
     */
    public abstract getBalance(address: string, tokenAddress?: string): Promise<BigNumber>;

    /**
     * Gets token's balance in wei.
     * @param tokenAddress Address of the smart-contract corresponding to the token.
     * @param address Wallet address, whose balance you want to find out.
     */
    public abstract getTokenBalance(address: string, tokenAddress: string): Promise<BigNumber>;

    /**
     * Gets balances of multiple tokens via multicall.
     * @param address Wallet address, which contains tokens.
     * @param tokensAddresses Tokens addresses.
     */
    public abstract getTokensBalances(
        address: string,
        tokensAddresses: string[]
    ): Promise<BigNumber[]>;

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
        const contractsData = tokenAddresses.map(contractAddress => ({
            contractAddress,
            methodsData: tokenFields.map(methodName => ({
                methodName,
                methodArguments: []
            }))
        }));
        const results = await this.multicallContractsMethods<string>(
            this.tokenContractAbi,
            contractsData
        );

        return results.map((tokenFieldsResults, tokenIndex) => {
            const tokenAddress = tokenAddresses[tokenIndex]!;
            if (this.Web3Pure.isNativeAddress(tokenAddress)) {
                const nativeToken = nativeTokensList[this.blockchainName];
                return {
                    ...nativeToken,
                    decimals: nativeToken.decimals.toString()
                };
            }

            return tokenFieldsResults.reduce((acc, field, fieldIndex) => {
                if (!field.success) {
                    throw new RubicSdkError(`Cannot retrieve information about ${tokenAddress}`);
                }
                return {
                    ...acc,
                    [tokenFields[fieldIndex]!]: field.success ? field.output! : undefined
                };
            }, {});
        });
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
    public abstract multicallContractsMethods<Output>(
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
     */
    public abstract callContractMethod<T = string>(
        contractAddress: string,
        contractAbi: AbiItem[],
        methodName: string,
        methodArguments: unknown[]
    ): Promise<T>;
}
