import BigNumber from 'bignumber.js';
import { RubicSdkError } from 'src/common/errors';
import { getFromWithoutFee } from 'src/features/common/utils/get-from-without-fee';

import { CROSS_CHAIN_TRADE_TYPE } from '../../models/cross-chain-trade-type';
import { rubicProxyContractAddress } from '../common/constants/rubic-proxy-contract-address';
import { CrossChainTransferTrade } from '../common/cross-chain-transfer-trade/cross-chain-transfer-trade';
import { CrossChainTransferData } from '../common/cross-chain-transfer-trade/models/cross-chain-payment-info';
import { BRIDGE_TYPE } from '../common/models/bridge-type';
import { TradeInfo } from '../common/models/trade-info';
import { ChangellyCcrTradeParams } from './models/changelly-ccr-trade-params';
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

        const exchangeParams: ChangellyExchangeSendParams = {
            from: this.changellyTokens.fromToken.ticker,
            to: this.changellyTokens.toToken.ticker,
            amountFrom: fromWithoutFee.tokenAmount.toFixed(),
            address: receiverAddress,
            rateId: this.rateId,
            ...(refundAddress && { refundAddress })
        };

        const { result: exchange } = await ChangellyApiService.createExchange(exchangeParams);

        const toAmount = new BigNumber(exchange.amountExpectedTo).minus(exchange.networkFee);

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
