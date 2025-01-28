import BigNumber from 'bignumber.js';
import { RubicSdkError } from 'src/common/errors';
import { BlockchainsInfo } from 'src/core/blockchain/utils/blockchains-info/blockchains-info';
import { getFromWithoutFee } from 'src/features/common/utils/get-from-without-fee';

import { CROSS_CHAIN_TRADE_TYPE } from '../../models/cross-chain-trade-type';
import { rubicProxyContractAddress } from '../common/constants/rubic-proxy-contract-address';
import { CrossChainTransferTrade } from '../common/cross-chain-transfer-trade/cross-chain-transfer-trade';
import { CrossChainTransferData } from '../common/cross-chain-transfer-trade/models/cross-chain-payment-info';
import { BRIDGE_TYPE } from '../common/models/bridge-type';
import { TradeInfo } from '../common/models/trade-info';
import { ChangellyCcrTradeParams } from './models/changelly-ccr-trade-params';
import { ChangellyEstimateResponse } from './models/changelly-estimate-response';
import { ChangellyExchangeSendParams } from './models/changelly-exchange-send-params';
import { ChangellyToken } from './models/changelly-token';
import { ChangellyApiService } from './services/changelly-api-service';

export class ChangellyCcrTrade extends CrossChainTransferTrade {
    /**
     * used in rubic-app to send as changelly_id to backend
     */
    public get changellyId(): string {
        return this.paymentInfo ? this.paymentInfo.id : '';
    }

    public readonly type = CROSS_CHAIN_TRADE_TYPE.CHANGELLY;

    public readonly onChainSubtype = { from: undefined, to: undefined };

    public readonly bridgeType = BRIDGE_TYPE.CHANGELLY;

    /**
     * rate id from getFixRateForAmount request
     */
    private readonly rateId: string;

    protected get fromContractAddress(): string {
        if (this.isProxyTrade) {
            return rubicProxyContractAddress[this.from.blockchain].gateway;
        }
        throw new RubicSdkError('No contract address for changelly provider');
    }

    private readonly changellyTokens: { fromToken: ChangellyToken; toToken: ChangellyToken };

    constructor(ccrTrade: ChangellyCcrTradeParams) {
        super({
            ...ccrTrade
        });

        this.changellyTokens = ccrTrade.changellyTokens;
        this.rateId = ccrTrade.rateId;
    }

    protected async getPaymentInfo(
        receiverAddress: string,
        refundAddress?: string
    ): Promise<CrossChainTransferData> {
        const fromWithoutFee = getFromWithoutFee(
            this.from,
            this.feeInfo.rubicProxy?.platformFee?.percent
        );

        const isFromEvm = BlockchainsInfo.isEvmBlockchainName(this.from.blockchain);
        const fromWithoutFeeTokenAmount = fromWithoutFee.tokenAmount.toFixed();
        let currRateId = this.rateId;

        if (!isFromEvm) {
            const quote = await this.getFixedRateQuote(fromWithoutFeeTokenAmount);
            currRateId = quote.id;
        }

        const refund = refundAddress || this.walletAddress;

        const exchangeParams: ChangellyExchangeSendParams = {
            from: this.changellyTokens.fromToken.ticker,
            to: this.changellyTokens.toToken.ticker,
            amountFrom: fromWithoutFeeTokenAmount,
            address: receiverAddress,
            rateId: currRateId,
            refundAddress: refund
        };

        const response = await ChangellyApiService.createExchange(exchangeParams);

        if (!response.result && response.error) {
            throw new RubicSdkError('Current trade already unavailable');
        }

        const exchange = response.result;

        const toAmount = new BigNumber(exchange.amountExpectedTo).minus(exchange.networkFee);

        this.actualTokenAmount = toAmount;

        return {
            toAmount: toAmount.toFixed(),
            id: exchange.id,
            depositAddress: exchange.payinAddress,
            ...(exchange.payinExtraId && {
                depositExtraId: exchange.payinExtraId,
                depositExtraIdName: this.changellyTokens.fromToken.extraIdName
            })
        };
    }

    private async getFixedRateQuote(
        fromWithoutFeeTokenAmount: string
    ): Promise<ChangellyEstimateResponse> {
        const fixRateEstimation = await ChangellyApiService.getFixedRateEstimation({
            from: this.changellyTokens.fromToken.ticker,
            to: this.changellyTokens.toToken.ticker,
            amountFrom: fromWithoutFeeTokenAmount
        });

        if (!fixRateEstimation.result && fixRateEstimation.error) {
            if (fixRateEstimation.error.message.includes('Invalid amount for')) {
                throw new RubicSdkError('Calculated rate already unavailable.');
            }

            throw new RubicSdkError(fixRateEstimation.error.message);
        }

        const quote = fixRateEstimation.result[0]!;

        return quote;
    }

    public getTradeInfo(): TradeInfo {
        return {
            estimatedGas: null,
            feeInfo: this.feeInfo,
            priceImpact: this.priceImpact ?? null,
            slippage: this.onChainTrade?.slippageTolerance
                ? this.onChainTrade.slippageTolerance * 100
                : 0,
            routePath: this.routePath
        };
    }
}
