import { QuoteRequestInterface, QuoteResponseInterface } from '@cryptorubic/core';
import BigNumber from 'bignumber.js';
import { RubicSdkError } from 'src/common/errors';
import { PriceTokenAmount } from 'src/common/tokens';
import { Web3Pure } from 'src/core/blockchain/web3-pure/web3-pure';
import { CROSS_CHAIN_TRADE_TYPE } from 'src/features/cross-chain/calculation-manager/models/cross-chain-trade-type';
import { ChangenowCurrency } from 'src/features/cross-chain/calculation-manager/providers/changenow-provider/models/changenow-currencies-api';
import { ChangenowTrade } from 'src/features/cross-chain/calculation-manager/providers/changenow-provider/models/changenow-trade';
import { rubicProxyContractAddress } from 'src/features/cross-chain/calculation-manager/providers/common/constants/rubic-proxy-contract-address';
import { BRIDGE_TYPE } from 'src/features/cross-chain/calculation-manager/providers/common/models/bridge-type';
import { RubicStep } from 'src/features/cross-chain/calculation-manager/providers/common/models/rubicStep';
import { EvmOnChainTrade } from 'src/features/on-chain/calculation-manager/common/on-chain-trade/evm-on-chain-trade/evm-on-chain-trade';

import { CrossChainTransferTrade } from '../common/cross-chain-transfer-trade/cross-chain-transfer-trade';
import {
    CrossChainPaymentInfo,
    CrossChainTransferData
} from '../common/cross-chain-transfer-trade/models/cross-chain-payment-info';
import { TradeInfo } from '../common/models/trade-info';
import { ChangenowSwapRequestBody } from './models/changenow-swap.api';
import { ChangeNowCrossChainApiService } from './services/changenow-cross-chain-api-service';

export class ChangenowCrossChainTrade extends CrossChainTransferTrade {
    /**
     * used in rubic-app to send as changenow_id to backend
     */
    public get changenowId(): string {
        return this.paymentInfo ? this.paymentInfo.id : '';
    }

    public readonly type = CROSS_CHAIN_TRADE_TYPE.CHANGENOW;

    public readonly onChainSubtype;

    public readonly bridgeType = BRIDGE_TYPE.CHANGENOW;

    private readonly fromCurrency: ChangenowCurrency;

    private readonly toCurrency: ChangenowCurrency;

    private get transitToken(): PriceTokenAmount {
        return this.onChainTrade ? this.onChainTrade.toTokenAmountMin : this.from;
    }

    protected get fromContractAddress(): string {
        if (this.isProxyTrade) {
            return rubicProxyContractAddress[this.from.blockchain].gateway;
        }
        throw new RubicSdkError('No contract address for changenow provider');
    }

    public readonly onChainTrade: EvmOnChainTrade | null;

    public get estimatedGas(): BigNumber | null {
        if (!this.gasData) {
            return null;
        }

        if (this.gasData.baseFee && this.gasData.maxPriorityFeePerGas) {
            return Web3Pure.fromWei(this.gasData.baseFee).plus(
                Web3Pure.fromWei(this.gasData.maxPriorityFeePerGas)
            );
        }

        if (this.gasData.gasPrice) {
            return Web3Pure.fromWei(this.gasData.gasPrice).multipliedBy(this.gasData.gasLimit ?? 0);
        }

        return null;
    }

    constructor(
        crossChainTrade: ChangenowTrade,
        providerAddress: string,
        routePath: RubicStep[],
        useProxy: boolean,
        apiQuote: QuoteRequestInterface,
        apiResponse: QuoteResponseInterface
    ) {
        super(
            providerAddress,
            routePath,
            useProxy,
            crossChainTrade.onChainTrade,
            crossChainTrade.from,
            crossChainTrade.to,
            new BigNumber(0),
            crossChainTrade.gasData,
            crossChainTrade.feeInfo,
            crossChainTrade.from.calculatePriceImpactPercent(crossChainTrade.to),
            apiQuote,
            apiResponse
        );
        this.fromCurrency = crossChainTrade.fromCurrency;
        this.toCurrency = crossChainTrade.toCurrency;
        this.onChainSubtype = crossChainTrade.onChainTrade
            ? { from: crossChainTrade.onChainTrade.type, to: undefined }
            : { from: undefined, to: undefined };
        this.onChainTrade = crossChainTrade.onChainTrade;
    }

    protected async getPaymentInfo(receiverAddress: string): Promise<CrossChainTransferData> {
        const params: ChangenowSwapRequestBody = {
            fromCurrency: this.fromCurrency.ticker,
            toCurrency: this.toCurrency.ticker,
            fromNetwork: this.fromCurrency.network,
            toNetwork: this.toCurrency.network,
            fromAmount: this.transitToken.tokenAmount.toFixed(),
            address: receiverAddress,
            flow: 'standard'
        };
        const res = await ChangeNowCrossChainApiService.getSwapTx(params);

        return {
            id: res.id,
            depositAddress: res.payinAddress,
            toAmount: res.toAmount.toString(),
            depositExtraId: res.payinExtraId,
            depositExtraIdName: res.payinExtraIdName
        };
    }

    public getTradeAmountRatio(fromUsd: BigNumber): BigNumber {
        return fromUsd.dividedBy(this.to.tokenAmount);
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

    /**
     * @deprecated Use getTransferTrade instead
     */
    public getChangenowPostTrade(receiverAddress: string): Promise<CrossChainPaymentInfo> {
        return super.getTransferTrade(receiverAddress);
    }
}
