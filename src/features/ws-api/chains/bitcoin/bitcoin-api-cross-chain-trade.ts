import { BitcoinBlockchainName, Token } from '@cryptorubic/core';
import BigNumber from 'bignumber.js';
import { PriceTokenAmount } from 'src/common/tokens';
import { CrossChainTradeType } from 'src/features/cross-chain/calculation-manager/models/cross-chain-trade-type';
import { BitcoinCrossChainTrade } from 'src/features/cross-chain/calculation-manager/providers/common/bitcoin-cross-chain-trade/bitcoin-cross-chain-trade';
import { BridgeType } from 'src/features/cross-chain/calculation-manager/providers/common/models/bridge-type';
import { FeeInfo } from 'src/features/cross-chain/calculation-manager/providers/common/models/fee-info';
import { OnChainSubtype } from 'src/features/cross-chain/calculation-manager/providers/common/models/on-chain-subtype';
import { TradeInfo } from 'src/features/cross-chain/calculation-manager/providers/common/models/trade-info';

import { BitcoinApiCrossChainConstructor } from './bitcoin-api-cross-chain-constructor';

export class BitcoinApiCrossChainTrade extends BitcoinCrossChainTrade {
    public readonly type: CrossChainTradeType;

    public readonly from: PriceTokenAmount<BitcoinBlockchainName>;

    public readonly to: PriceTokenAmount;

    public readonly toTokenAmountMin: BigNumber;

    public bridgeType: BridgeType;

    public readonly onChainSubtype: OnChainSubtype = { from: undefined, to: undefined };

    public readonly priceImpact: number | null;

    public readonly slippage: number;

    public readonly feeInfo: FeeInfo;

    public readonly isAggregator = false;

    //@TODO API
    public memo: string = '';

    constructor(tradeParams: BitcoinApiCrossChainConstructor) {
        super(
            tradeParams.apiQuote.integratorAddress!,
            tradeParams.routePath,
            false,
            tradeParams.apiQuote,
            tradeParams.apiResponse
        );

        this.type = tradeParams.apiResponse.providerType as CrossChainTradeType;
        this.bridgeType = this.type;
        this.from = tradeParams.from;
        this.to = tradeParams.to;
        this.toTokenAmountMin = Token.fromWei(
            tradeParams.apiResponse.estimate.destinationWeiMinAmount,
            tradeParams.to.decimals
        );

        this.priceImpact = tradeParams.apiResponse.estimate.priceImpact;
        this.slippage = tradeParams.apiResponse.estimate.slippage;
        this.feeInfo = tradeParams.feeInfo;
    }

    public getTradeInfo(): TradeInfo {
        return {
            estimatedGas: this.estimatedGas,
            feeInfo: this.feeInfo,
            priceImpact: this.priceImpact,
            slippage: this.slippage * 100,
            routePath: this.routePath
        };
    }
}
