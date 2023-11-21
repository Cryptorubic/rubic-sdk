import BigNumber from 'bignumber.js';
import { Asset } from 'rango-sdk-basic';
import { PriceTokenAmount } from 'src/common/tokens';
import { EvmBlockchainName } from 'src/core/blockchain/models/blockchain-name';

import { RequiredCrossChainOptions } from '../../../models/cross-chain-options';
import { GasData } from '../../common/emv-cross-chain-trade/models/gas-data';
import { BridgeType } from '../../common/models/bridge-type';
import { FeeInfo } from '../../common/models/fee-info';
import { OnChainSubtype } from '../../common/models/on-chain-subtype';
import { RubicStep } from '../../common/models/rubicStep';

export interface TransformedCalculationRequiredParams {
    fromAsset: Asset;
    toAsset: Asset;
    amount: string;
}

/**
 * @property {BlockchainName[]} swappers List of all accepted swappers (e.g. providers), an empty list means no filter is required
 * @property {boolean} [swappersExclude] - Indicates include/exclude mode for the swappers param
 */
export type RangoCrossChainOptions = RequiredCrossChainOptions & {
    swappers?: EvmBlockchainName[];
    swappersExclude?: boolean;
};

export interface RangoCrossChainTradeConstructorParams {
    crossChainTrade: {
        from: PriceTokenAmount<EvmBlockchainName>;
        to: PriceTokenAmount<EvmBlockchainName>;
        route: Route;
        gasData: GasData | null;
        toTokenAmountMin: BigNumber;
        feeInfo: FeeInfo;
        priceImpact: number | null;
        onChainSubtype: OnChainSubtype;
        bridgeType: BridgeType;
        slippage: number;
    };
    providerAddress: string;
    routePath: RubicStep[];
}

export interface RangoBestTradeQueryParams {
    from: string;
    to: string;
    amount: string;
    swappers?: EvmBlockchainName[];
    swappersExclude?: boolean;
}

export interface RangoBestTradeResponse {
    requestId: string;
    resultType: RoutingResultType;
    route: RangoBestTradeSimulationResult | null;
    error: string | null;
}

interface RangoBestTradeSimulationResult {
    from: RangoResponseToken;
    to: RangoResponseToken;
    outputAmount: string;
    outputAmountMin: string;
    outputAmountUsd: number | null;
    swapper: RangoSwapperMeta;
    path: RangoQuotePath[] | null;
    fee: RangoSwapFee[];
    feeUsd: number | null;
    amountRestriction: RangoAmountRestriction | null;
    estimatedTimeInSeconds: number;
}

interface RangoSwapperMeta {
    id: string;
    title: string;
    logo: string;
    swapperGroup: string;
    types: SwapperType[];
}

interface RangoResponseToken {
    blockchain: string;
    chainId: string | null;
    address: string | null;
    symbol: string;
    name: string;
    decimals: number;
    image: string;
    blockchainImage: string;
    usdPrice: number | null;
    isPopular: boolean;
}

interface RangoQuotePath {
    from: RangoResponseToken;
    to: RangoResponseToken;
    swapper: RangoSwapperMeta;
    swapperType: SwapperType;
    expectedOutput: string;
    estimatedTimeInSeconds: number;
}

interface RangoSwapFee {
    name: string;
    token: RangoResponseToken;
    expenseType: ExpenseType;
    amount: string;
}

interface RangoAmountRestriction {
    min: string | null;
    max: string | null;
    type: AmountRestrictionType;
}

export const RangoRoutingResult = {
    OK: 'OK',
    HIGH_IMPACT: 'HIGH_IMPACT',
    NO_ROUTE: 'NO_ROUTE',
    INPUT_LIMIT_ISSUE: 'INPUT_LIMIT_ISSUE'
} as const;

export type SwapperType = 'BRIDGE' | 'DEX' | 'AGGREGATOR';

export type ExpenseType = 'FROM_SOURCE_WALLET' | 'DECREASE_FROM_OUTPUT' | 'FROM_DESTINATION_WALLET';

export type AmountRestrictionType = 'INCLUSIVE' | 'EXCLUSIVE';

export type RoutingResultType = keyof typeof RangoRoutingResult;
