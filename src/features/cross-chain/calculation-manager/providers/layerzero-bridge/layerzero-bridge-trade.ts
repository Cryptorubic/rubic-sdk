import { QuoteRequestInterface, QuoteResponseInterface } from '@cryptorubic/core';
import BigNumber from 'bignumber.js';
import { PriceTokenAmount } from 'src/common/tokens';
import { CROSS_CHAIN_TRADE_TYPE } from 'src/features/cross-chain/calculation-manager/models/cross-chain-trade-type';
import { EvmCrossChainTrade } from 'src/features/cross-chain/calculation-manager/providers/common/evm-cross-chain-trade/evm-cross-chain-trade';
import { GasData } from 'src/features/cross-chain/calculation-manager/providers/common/evm-cross-chain-trade/models/gas-data';
import { BRIDGE_TYPE } from 'src/features/cross-chain/calculation-manager/providers/common/models/bridge-type';
import { FeeInfo } from 'src/features/cross-chain/calculation-manager/providers/common/models/fee-info';
import { RubicStep } from 'src/features/cross-chain/calculation-manager/providers/common/models/rubicStep';
import { TradeInfo } from 'src/features/cross-chain/calculation-manager/providers/common/models/trade-info';

import { layerZeroProxyOFT } from './constants/layerzero-bridge-address';
import { LayerZeroBridgeSupportedBlockchain } from './models/layerzero-bridge-supported-blockchains';

export class LayerZeroBridgeTrade extends EvmCrossChainTrade {
    public readonly onChainSubtype = { from: undefined, to: undefined };

    public readonly type = CROSS_CHAIN_TRADE_TYPE.LAYERZERO;

    public readonly isAggregator = false;

    public readonly bridgeType = BRIDGE_TYPE.LAYERZERO;

    public readonly from: PriceTokenAmount<LayerZeroBridgeSupportedBlockchain>;

    public readonly to: PriceTokenAmount<LayerZeroBridgeSupportedBlockchain>;

    public readonly toTokenAmountMin: BigNumber;

    public readonly gasData: GasData | null;

    protected get fromContractAddress(): string {
        return layerZeroProxyOFT[this.from.blockchain];
    }

    public readonly feeInfo: FeeInfo = {};

    public readonly onChainTrade = null;

    protected get methodName(): string {
        return 'sendFrom';
    }

    constructor(
        crossChainTrade: {
            from: PriceTokenAmount<LayerZeroBridgeSupportedBlockchain>;
            to: PriceTokenAmount<LayerZeroBridgeSupportedBlockchain>;
            gasData: GasData | null;
        },
        providerAddress: string,
        routePath: RubicStep[],
        useProxy: boolean,
        apiQuote: QuoteRequestInterface,
        apiResponse: QuoteResponseInterface
    ) {
        super(providerAddress, routePath, useProxy, apiQuote, apiResponse);

        this.from = crossChainTrade.from;
        this.to = crossChainTrade.to;
        this.gasData = crossChainTrade.gasData;
        this.toTokenAmountMin = crossChainTrade.to.tokenAmount;
    }

    public getTradeAmountRatio(fromUsd: BigNumber): BigNumber {
        return fromUsd.dividedBy(this.to.tokenAmount);
    }

    public getTradeInfo(): TradeInfo {
        return {
            estimatedGas: this.estimatedGas,
            feeInfo: this.feeInfo,
            priceImpact: null,
            slippage: 0,
            routePath: this.routePath
        };
    }
}
