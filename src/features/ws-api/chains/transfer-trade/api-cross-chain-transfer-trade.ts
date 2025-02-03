import { CrossChainTradeType } from 'src/features/cross-chain/calculation-manager/models/cross-chain-trade-type';
import { CrossChainTransferTrade } from 'src/features/cross-chain/calculation-manager/providers/common/cross-chain-transfer-trade/cross-chain-transfer-trade';
import { ApiCrossChainTransferConstructor } from './api-cross-chain-transfer-constructor';
import { SwapRequestInterface, Token } from '@cryptorubic/core';
import { TradeInfo } from 'src/features/cross-chain/calculation-manager/providers/common/models/trade-info';
import { BridgeType } from 'src/features/cross-chain/calculation-manager/providers/common/models/bridge-type';
import { OnChainSubtype } from 'src/features/cross-chain/calculation-manager/providers/common/models/on-chain-subtype';
import { CrossChainTransferData } from 'src/features/cross-chain/calculation-manager/providers/common/cross-chain-transfer-trade/models/cross-chain-payment-info';
import { Injector } from 'src/core/injector/injector';
import { EvmEncodeConfig } from 'src/core/blockchain/web3-pure/typed-web3-pure/evm-web3-pure/models/evm-encode-config';
import { CrossChainTransferConfig } from 'src/features/cross-chain/calculation-manager/providers/common/cross-chain-transfer-trade/models/cross-chain-transfer-config';

export class ApiCrossChainTransferTrade extends CrossChainTransferTrade {
    public readonly type: CrossChainTradeType;

    public readonly bridgeType: BridgeType;

    public onChainSubtype: OnChainSubtype = { from: undefined, to: undefined };

    constructor(tradeParams: ApiCrossChainTransferConstructor) {
        super(
            tradeParams.apiQuote.integratorAddress!,
            tradeParams.routePath,
            false,
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

    protected async getPaymentInfo(receiverAddress: string): Promise<CrossChainTransferData> {
        const swapRequestData: SwapRequestInterface = {
            ...this.apiQuote,
            fromAddress: this.walletAddress,
            receiver: receiverAddress,
            id: this.apiResponse.id
        };
        const { estimate, transaction } =
            await Injector.rubicApiService.fetchSwapData<CrossChainTransferConfig>(swapRequestData);

        const amount = estimate.destinationWeiAmount;

        return {
            toAmount: amount,
            id: transaction.exchangeId,
            depositAddress: transaction.depositAddress,
            depositExtraId: transaction.extraFields?.value,
            depositExtraIdName: transaction.extraFields?.name
        };
    }
}
