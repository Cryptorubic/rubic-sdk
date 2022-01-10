import { CrossChainSupportedBlockchain } from '../constants/cross-chain-supported-blockchains';
import { CrossChainContractData } from '../contract-data/cross-chain-contract-data';
import BigNumber from 'bignumber.js';
import { PriceTokenAmount } from '../../../core/blockchain/tokens/price-token-amount';
import { Token } from '../../../core/blockchain/tokens/token';
import { AbiItem } from 'web3-utils';
import { UniswapV2AbstractProvider } from '../..';
export declare abstract class ContractTrade {
    readonly blockchain: CrossChainSupportedBlockchain;
    readonly contract: CrossChainContractData;
    private readonly providerIndex;
    abstract readonly fromToken: PriceTokenAmount;
    abstract readonly toToken: PriceTokenAmount;
    abstract readonly toTokenAmountMin: BigNumber;
    abstract readonly path: ReadonlyArray<Token>;
    get provider(): UniswapV2AbstractProvider;
    private get providerData();
    protected constructor(blockchain: CrossChainSupportedBlockchain, contract: CrossChainContractData, providerIndex: number);
    /**
     * Returns method's name and contract abi to call in source network.
     */
    getMethodNameAndContractAbi(): {
        methodName: string;
        contractAbi: AbiItem[];
    };
    /**
     * Returns method's arguments to use in source network.
     */
    getMethodArguments(toContractTrade: ContractTrade, walletAddress: string): Promise<unknown[]>;
    /**
     * Returns `first path` method argument, converted from instant-trade data and chosen provider.
     * Must be called on source contract.
     */
    protected abstract getFirstPath(): string[];
    /**
     * Returns `second path` method argument, converted from instant-trade data and chosen provider.
     * Must be called on target contract.
     */
    protected abstract getSecondPath(): string[];
    /**
     * Returns `signature` method argument, build from function name and its arguments.
     * Example: `${function_name_in_target_network}(${arguments})`.
     * Must be called on target contract.
     */
    getSwapToUserMethodSignature(): string;
    /**
     * Returns signature of arguments of cross-chain swap method.
     * @param contractAbiMethod Swap method in cross-chain contract.
     */
    private getArgumentsSignature;
}
