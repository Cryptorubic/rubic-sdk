import { InstantTrade } from '../../../instant-trade';
import { PriceTokenAmount } from '../../../../../core/blockchain/tokens/price-token-amount';
import { UniSwapV3Route } from './models/uni-swap-v3-route';
import { SwapTransactionOptions } from '../../../models/swap-transaction-options';
import { TradeType } from '../../../..';
import { TransactionReceipt } from 'web3-eth';
import { PriceToken } from '../../../../../core/blockchain/tokens/price-token';
import { TransactionConfig } from 'web3-core';
import { EncodeTransactionOptions } from '../../../models/encode-transaction-options';
import { GasFeeInfo } from '../../../models/gas-fee-info';
import { Token } from '../../../../../core/blockchain/tokens/token';
import { SwapOptions } from '../../../models/swap-options';
import BigNumber from 'bignumber.js';
declare type UniswapV3TradeStruct = {
    from: PriceTokenAmount;
    to: PriceTokenAmount;
    slippageTolerance: number;
    deadlineMinutes: number;
    route: UniSwapV3Route;
    gasFeeInfo?: GasFeeInfo | null;
};
export declare class UniSwapV3Trade extends InstantTrade {
    static estimateGasLimitForRoute(from: PriceTokenAmount, toToken: PriceToken, options: Required<SwapOptions>, route: UniSwapV3Route): Promise<BigNumber>;
    static estimateGasLimitForRoutes(from: PriceTokenAmount, toToken: PriceToken, options: Required<SwapOptions>, routes: UniSwapV3Route[]): Promise<BigNumber[]>;
    private static getEstimateGasParams;
    readonly from: PriceTokenAmount;
    readonly to: PriceTokenAmount;
    readonly gasFeeInfo: GasFeeInfo | null;
    slippageTolerance: number;
    deadlineMinutes: number;
    protected readonly contractAddress = "0xE592427A0AEce92De3Edee1F18E0157C05861564";
    private readonly route;
    get type(): TradeType;
    private get deadlineMinutesTimestamp();
    get path(): ReadonlyArray<Token>;
    constructor(tradeStruct: UniswapV3TradeStruct);
    swap(options?: SwapTransactionOptions): Promise<TransactionReceipt>;
    encode(options?: EncodeTransactionOptions): Promise<TransactionConfig>;
    private getSwapRouterMethodData;
    /**
     * Returns swap `exactInput` method's name and arguments to use in Swap contract.
     */
    private getSwapRouterExactInputMethodData;
    /**
     * Returns encoded data of estimated gas function and default estimated gas.
     */
    private getEstimateGasParams;
}
export {};
