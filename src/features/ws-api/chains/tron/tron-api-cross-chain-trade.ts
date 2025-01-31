import { TronBlockchainName } from '@cryptorubic/core';
import BigNumber from 'bignumber.js';
import { PriceTokenAmount } from 'src/common/tokens';
import { CrossChainTradeType } from 'src/features/cross-chain/calculation-manager/models/cross-chain-trade-type';
import { GasData } from 'src/features/cross-chain/calculation-manager/providers/common/evm-cross-chain-trade/models/gas-data';
import { FeeInfo } from 'src/features/cross-chain/calculation-manager/providers/common/models/fee-info';
import { OnChainSubtype } from 'src/features/cross-chain/calculation-manager/providers/common/models/on-chain-subtype';
import { TradeInfo } from 'src/features/cross-chain/calculation-manager/providers/common/models/trade-info';
import { TronCrossChainTrade } from 'src/features/cross-chain/calculation-manager/providers/common/tron-cross-chain-trade/tron-cross-chain-trade';
import { TronApiCrossChainConstructor } from 'src/features/ws-api/chains/tron/tron-api-cross-chain-constructor';

export class TronApiCrossChainTrade extends TronCrossChainTrade {
    public readonly feeInfo: FeeInfo;

    public readonly from: PriceTokenAmount<TronBlockchainName>;

    public readonly gasData: GasData;

    public readonly onChainSubtype: OnChainSubtype = { from: undefined, to: undefined };

    public readonly to: PriceTokenAmount;

    public readonly toTokenAmountMin: BigNumber;

    public readonly type: CrossChainTradeType;

    public readonly priceImpact: number | null;

    public readonly slippage: number;

    public readonly bridgeType: CrossChainTradeType;

    public readonly isAggregator = false;

    constructor(params: TronApiCrossChainConstructor) {
        super(
            params.apiQuote.integratorAddress!,
            params.routePath,
            false,
            params.apiQuote,
            params.apiResponse
        );

        this.type = params.apiResponse.providerType as CrossChainTradeType;
        this.bridgeType = this.type;
        this.toTokenAmountMin = new BigNumber(params.apiResponse.estimate.destinationWeiMinAmount);
        this.priceImpact = params.apiResponse.estimate.priceImpact;
        this.slippage = params.apiResponse.estimate.slippage;

        this.to = params.to;
        this.feeInfo = params.feeInfo;
        this.from = params.from;
        this.gasData = null;
    }

    public getTradeInfo(): TradeInfo {
        return {
            estimatedGas: null,
            feeInfo: this.feeInfo,
            priceImpact: this.priceImpact,
            slippage: this.slippage,
            routePath: this.routePath
        };
    }
}
