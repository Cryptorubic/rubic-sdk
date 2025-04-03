import { SwapRequestInterface, Token } from '@cryptorubic/core';
import BigNumber from 'bignumber.js';
import { Injector } from 'src/core/injector/injector';
import { CrossChainTradeType } from 'src/features/cross-chain/calculation-manager/models/cross-chain-trade-type';
import { CrossChainTransferTrade } from 'src/features/cross-chain/calculation-manager/providers/common/cross-chain-transfer-trade/cross-chain-transfer-trade';
import { CrossChainTransferData } from 'src/features/cross-chain/calculation-manager/providers/common/cross-chain-transfer-trade/models/cross-chain-payment-info';
import { CrossChainTransferConfig } from 'src/features/cross-chain/calculation-manager/providers/common/cross-chain-transfer-trade/models/cross-chain-transfer-config';
import { BridgeType } from 'src/features/cross-chain/calculation-manager/providers/common/models/bridge-type';
import { OnChainSubtype } from 'src/features/cross-chain/calculation-manager/providers/common/models/on-chain-subtype';
import { TradeInfo } from 'src/features/cross-chain/calculation-manager/providers/common/models/trade-info';

import { ApiCrossChainTransferConstructor } from './api-cross-chain-transfer-constructor';
import { TransferSwapRequestInterface } from './models/transfer-swap-request-interface';

export class ApiCrossChainTransferTrade extends CrossChainTransferTrade {
    public readonly type: CrossChainTradeType;

    public readonly bridgeType: BridgeType;

    public onChainSubtype: OnChainSubtype = { from: undefined, to: undefined };

    constructor(tradeParams: ApiCrossChainTransferConstructor) {
        super(
            tradeParams.apiQuote.integratorAddress!,
            tradeParams.routePath,
            null,
            tradeParams.from,
            tradeParams.to,
            Token.fromWei(
                tradeParams.apiResponse.estimate.destinationWeiMinAmount,
                tradeParams.to.decimals
            ),
            null,
            tradeParams.feeInfo,
            tradeParams.from.calculatePriceImpactPercent(tradeParams.to),
            tradeParams.apiQuote,
            tradeParams.apiResponse
        );

        this.type = tradeParams.apiResponse.providerType as CrossChainTradeType;
        this.bridgeType = tradeParams.apiResponse.providerType as CrossChainTradeType;
    }

    public getTradeInfo(): TradeInfo {
        return {
            estimatedGas: this.estimatedGas,
            feeInfo: this.feeInfo,
            priceImpact: this.priceImpact ?? null,
            slippage: this.onChainTrade?.slippageTolerance
                ? this.onChainTrade.slippageTolerance * 100
                : 0,
            routePath: this.routePath
        };
    }

    protected async getPaymentInfo(
        receiverAddress: string,
        testMode: boolean,
        refundAddress?: string
    ): Promise<CrossChainTransferData> {
        const swapRequestData: TransferSwapRequestInterface = {
            ...this.apiQuote,
            //@TODO API add refundAddress field for swap requests
            fromAddress: refundAddress ? refundAddress : undefined,
            receiver: receiverAddress,
            id: this.apiResponse.id,
            enableChecks: !testMode
        };
        const { estimate, transaction } =
            await Injector.rubicApiService.fetchSwapData<CrossChainTransferConfig>(swapRequestData);

        const amount = estimate.destinationTokenAmount;

        this.actualTokenAmount = new BigNumber(amount);

        return {
            toAmount: amount,
            id: transaction.exchangeId,
            depositAddress: transaction.depositAddress,
            depositExtraId: transaction.extraFields?.value,
            depositExtraIdName: transaction.extraFields?.name
        };
    }
}
