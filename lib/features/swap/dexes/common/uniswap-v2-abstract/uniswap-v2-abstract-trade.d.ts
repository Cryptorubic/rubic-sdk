import { BLOCKCHAIN_NAME } from '../../../../../core/blockchain/models/BLOCKCHAIN_NAME';
import { PriceTokenAmount } from '../../../../../core/blockchain/tokens/price-token-amount';
import { Token } from '../../../../../core/blockchain/tokens/token';
import { BatchCall } from '../../../../../core/blockchain/web3-public/models/batch-call';
import { ContractMulticallResponse } from '../../../../../core/blockchain/web3-public/models/contract-multicall-response';
import { GasFeeInfo } from '../../../models/gas-fee-info';
import { InstantTrade } from '../../../instant-trade';
import { SwapTransactionOptions } from '../../../models/swap-transaction-options';
import { ExactInputOutputSwapMethodsList } from './constants/SWAP_METHOD';
import { DefaultEstimatedGas } from './models/default-estimated-gas';
import BigNumber from 'bignumber.js';
import { TradeType } from '../../../..';
import { TransactionConfig } from 'web3-core';
import { TransactionReceipt } from 'web3-eth';
import { AbiItem } from 'web3-utils';
import { EncodeFromAddressTransactionOptions } from '../../../models/encode-transaction-options';
export declare type UniswapV2TradeStruct = {
    from: PriceTokenAmount;
    to: PriceTokenAmount;
    exact: 'input' | 'output';
    wrappedPath: ReadonlyArray<Token> | Token[];
    deadlineMinutes: number;
    slippageTolerance: number;
    gasFeeInfo?: GasFeeInfo | null;
};
export declare abstract class UniswapV2AbstractTrade extends InstantTrade {
    static getContractAddress(blockchain: BLOCKCHAIN_NAME): string;
    static get type(): TradeType;
    static readonly contractAbi: AbiItem[];
    static readonly swapMethods: ExactInputOutputSwapMethodsList;
    static readonly defaultEstimatedGasInfo: DefaultEstimatedGas;
    static callForRoutes(blockchain: BLOCKCHAIN_NAME, exact: 'input' | 'output', routesMethodArguments: [string, string[]][]): Promise<ContractMulticallResponse<{
        amounts: string[];
    }>[]>;
    deadlineMinutes: number;
    slippageTolerance: number;
    readonly from: PriceTokenAmount;
    readonly to: PriceTokenAmount;
    gasFeeInfo: GasFeeInfo | null;
    readonly path: ReadonlyArray<Token>;
    readonly wrappedPath: ReadonlyArray<Token>;
    readonly exact: 'input' | 'output';
    get type(): TradeType;
    set settings(value: {
        deadlineMinutes?: number;
        slippageTolerance?: number;
    });
    private get deadlineMinutesTimestamp();
    private get nativeValueToSend();
    private get callParameters();
    private get regularSwapMethod();
    private get supportedFeeSwapMethod();
    private get regularSwapMethodKey();
    protected constructor(tradeStruct: UniswapV2TradeStruct);
    private getAmountInAndAmountOut;
    swap(options?: SwapTransactionOptions): Promise<TransactionReceipt>;
    private createAnyToAnyTrade;
    encode(options: EncodeFromAddressTransactionOptions): Promise<TransactionConfig>;
    private encodeAnyToAnyTrade;
    private getMethodName;
    private getSwapParametersByMethod;
    private convertSwapParametersToCallParameters;
    getEstimatedGasCallData(): BatchCall;
    getDefaultEstimatedGas(): BigNumber;
    private estimateGasForAnyToAnyTrade;
    protected getGasLimit(options?: {
        gasLimit?: string | null;
    }): string;
}
