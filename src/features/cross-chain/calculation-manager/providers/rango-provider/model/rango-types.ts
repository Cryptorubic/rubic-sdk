import BigNumber from 'bignumber.js';
import { Asset } from 'rango-sdk-basic';
import { PriceTokenAmount } from 'src/common/tokens';
import { EvmBlockchainName } from 'src/core/blockchain/models/blockchain-name';

import { RequiredCrossChainOptions } from '../../../models/cross-chain-options';
import { GasData } from '../../common/emv-cross-chain-trade/models/gas-data';
import { FeeInfo } from '../../common/models/fee-info';
import { RubicStep } from '../../common/models/rubicStep';
import { RangoCrossChainSupportedBlockchain } from './rango-cross-chain-supported-blockchains';

export interface TransformedCalculationRequiredParams {
    fromAsset: Asset;
    toAsset: Asset;
    amount: string;
}

/**
 * @property {RangoCrossChainSupportedBlockchain[]} swappers List of all accepted swappers (e.g. providers), an empty list means no filter is required
 * @property {boolean} [swappersExclude] - Indicates include/exclude mode for the swappers param
 */
export type RangoCrossChainOptions = RequiredCrossChainOptions & {
    swappers?: RangoCrossChainSupportedBlockchain[];
    swappersExclude?: boolean;
};

/**
 * @property {string} from 
 *Combine fromBlockchainName(!!!!!!!!!several chain-names in rango-api are different with Rubic: Avalanche in rango - `AVAX_CCHAIN`, in rubic - `AVALANCHE`),
fromTokenSymbol(e.g. ETH, BNB etc.) and fromTokenContractAddress
 *and should look like  `blockchainName.tokenSymbol--tokenAddress` without spaces
 * @property {string} to same as `from` but with data of target token
 * @property {string} amount amount of `from` token to exchange - use Web3Pure.toWei(tokenAmount) to get in string type
 * @property {string} slippage Amount of user's preferred slippage in percent
 * @property {string} fromAddress User wallet address
 * @property {string} toAddress Destination wallet address
 * @property {RangoCrossChainSupportedBlockchain[]} swappers List of all accepted swappers (e.g. providers), an empty list means no filter is required
 * @property {boolean} [swappersExclude] - Indicates include/exclude mode for the swappers param
 */
export interface RangoSwapQueryParams {
    from: string;
    to: string;
    amount: string;
    slippage: number;
    fromAddress: string;
    toAddress: string;
    swappers?: RangoCrossChainSupportedBlockchain[];
    swappersExclude?: boolean;
}
export interface RangoCrossChainTradeConstructorParams {
    crossChainTrade: {
        from: PriceTokenAmount<EvmBlockchainName>;
        to: PriceTokenAmount<EvmBlockchainName>;
        gasData: GasData | null;
        toTokenAmountMin: BigNumber;
        feeInfo: FeeInfo;
        priceImpact: number | null;
        slippage: number;
        swapQueryParams: RangoSwapQueryParams;
    };
    providerAddress: string;
    routePath: RubicStep[];
}

export interface RangoBestRouteQueryParams {
    from: string;
    to: string;
    amount: string;
    swappers?: EvmBlockchainName[];
    swappersExclude?: boolean;
}

export interface RangoBestRouteResponse {
    requestId: string;
    resultType: RoutingResultType;
    route: RangoBestRouteSimulationResult | null;
    error: string | null;
}

export interface RangoBestRouteSimulationResult {
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
