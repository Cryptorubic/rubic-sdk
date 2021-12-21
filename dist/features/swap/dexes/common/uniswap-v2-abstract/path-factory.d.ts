import { PriceToken } from '../../../../../core/blockchain/tokens/price-token';
import { SwapCalculationOptions } from '../../../models/swap-calculation-options';
import { UniswapCalculatedInfo } from './models/uniswap-calculated-info';
import { UniswapV2ProviderConfiguration } from './models/uniswap-v2-provider-configuration';
import { UniswapV2TradeClass } from './models/uniswap-v2-trade-class';
import { UniswapV2AbstractTrade } from './uniswap-v2-abstract-trade';
import BigNumber from 'bignumber.js';
export interface PathFactoryStruct {
    readonly from: PriceToken;
    readonly to: PriceToken;
    readonly weiAmount: BigNumber;
    readonly exact: 'input' | 'output';
    readonly options: Required<SwapCalculationOptions>;
}
export interface UniswapV2AbstractProviderStruct<T extends UniswapV2AbstractTrade> {
    readonly InstantTradeClass: UniswapV2TradeClass<T>;
    readonly providerSettings: UniswapV2ProviderConfiguration;
}
export declare class PathFactory<T extends UniswapV2AbstractTrade> {
    private readonly web3Public;
    private readonly from;
    private readonly to;
    private readonly weiAmount;
    private readonly exact;
    private readonly options;
    private readonly InstantTradeClass;
    private readonly routingProvidersAddresses;
    private readonly maxTransitTokens;
    private get walletAddress();
    private get stringWeiAmount();
    constructor(uniswapProviderStruct: UniswapV2AbstractProviderStruct<T>, pathFactoryStruct: PathFactoryStruct);
    getAmountAndPath(gasPriceInUsd: BigNumber | undefined): Promise<UniswapCalculatedInfo>;
    private getGasRequests;
    private getDefaultGases;
    private getTradesByRoutes;
    private getAllRoutes;
}
