import { CrossChainSupportedBlockchain } from '../constants/cross-chain-supported-blockchains';
import { ContractData } from '../contract-data/contract-data';
import BigNumber from 'bignumber.js';
import { PriceTokenAmount } from '../../../core/blockchain/tokens/price-token-amount';
import { Token } from '../../../core/blockchain/tokens/token';
import { AbiItem } from 'web3-utils';
import { UniswapV2AbstractProvider } from '../..';
export declare abstract class ContractTrade {
    readonly blockchain: CrossChainSupportedBlockchain;
    readonly contract: ContractData;
    private readonly providerIndex;
    abstract get fromToken(): PriceTokenAmount;
    abstract get toToken(): PriceTokenAmount;
    abstract get toTokenAmountMin(): BigNumber;
    abstract get path(): ReadonlyArray<Token>;
    get provider(): UniswapV2AbstractProvider;
    private get providerData();
    protected constructor(blockchain: CrossChainSupportedBlockchain, contract: ContractData, providerIndex: number);
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
    getMethodArguments(toContractTrade: ContractTrade, walletAddress: string): unknown[];
    /**
     * Returns `first path` method argument, converted from instant-trade data and chosen provider.
     * Must be called on source contract.
     */
    abstract getFirstPath(): string[];
    /**
     * Returns `second path` method argument, converted from instant-trade data and chosen provider.
     * Must be called on target contract.
     */
    abstract getSecondPath(): string[];
    /**
     * Returns `signature` method argument, build from function name and its arguments.
     * Example: `${function_name_in_target_network}(${arguments})`.
     * Must be called on target contract.
     */
    getSwapToUserMethodSignature(): string;
}
