import { QuoteRequestInterface, QuoteResponseInterface } from '@cryptorubic/core';
import { RubicSdkError } from 'src/common/errors';
import { PriceTokenAmount } from 'src/common/tokens';
import { EvmBlockchainName } from 'src/core/blockchain/models/blockchain-name';
import { BlockchainsInfo } from 'src/core/blockchain/utils/blockchains-info/blockchains-info';
import { Injector } from 'src/core/injector/injector';
import { getFromWithoutFee } from 'src/features/common/utils/get-from-without-fee';

import { CROSS_CHAIN_TRADE_TYPE } from '../../models/cross-chain-trade-type';
import { rubicProxyContractAddress } from '../common/constants/rubic-proxy-contract-address';
import { CrossChainTransferTrade } from '../common/cross-chain-transfer-trade/cross-chain-transfer-trade';
import { CrossChainTransferData } from '../common/cross-chain-transfer-trade/models/cross-chain-payment-info';
import { GasData } from '../common/evm-cross-chain-trade/models/gas-data';
import { BRIDGE_TYPE } from '../common/models/bridge-type';
import { FeeInfo } from '../common/models/fee-info';
import { OnChainSubtype } from '../common/models/on-chain-subtype';
import { RubicStep } from '../common/models/rubicStep';
import { TradeInfo } from '../common/models/trade-info';
import { SimpleSwapCcrSupportedChain } from './constants/simple-swap-ccr-api-blockchain';
import { SimpleSwapCurrency } from './models/simple-swap-currency';
import { SimpleSwapExchangeRequest } from './models/simple-swap-requests';
import { SimpleSwapApiService } from './services/simple-swap-api-service';
import BigNumber from 'bignumber.js';

export class SimpleSwapCcrTrade extends CrossChainTransferTrade {
    public get simpleSwapId(): string {
        return this.paymentInfo ? this.paymentInfo.id : '';
    }

    public readonly type = CROSS_CHAIN_TRADE_TYPE.SIMPLE_SWAP;

    public readonly onChainSubtype: OnChainSubtype = { from: undefined, to: undefined };

    public readonly bridgeType = BRIDGE_TYPE.SIMPLE_SWAP;

    private readonly fromCurrency: SimpleSwapCurrency;

    private readonly toCurrency: SimpleSwapCurrency;

    protected get fromContractAddress(): string {
        if (this.isProxyTrade) {
            return rubicProxyContractAddress[this.from.blockchain].gateway;
        }
        throw new RubicSdkError('No contract address for simple swap provider');
    }

    constructor(
        crossChainTrade: {
            from: PriceTokenAmount<EvmBlockchainName>;
            to: PriceTokenAmount<SimpleSwapCcrSupportedChain>;
            gasData: GasData | null;
            feeInfo: FeeInfo;
            priceImpact: number | null;
            fromCurrency: SimpleSwapCurrency;
            toCurrency: SimpleSwapCurrency;
        },
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
            null,
            crossChainTrade.from,
            crossChainTrade.to,
            new BigNumber(0),
            crossChainTrade.gasData,
            crossChainTrade.feeInfo,
            crossChainTrade.priceImpact,
            apiQuote,
            apiResponse
        );

        this.fromCurrency = crossChainTrade.fromCurrency;
        this.toCurrency = crossChainTrade.toCurrency;
    }

    // TODO API
    protected async getPaymentInfo(receiverAddress: string): Promise<CrossChainTransferData> {
        const walletAddress =
            BlockchainsInfo.isEvmBlockchainName(this.from.blockchain) &&
            Injector.web3PrivateService.getWeb3PrivateByBlockchain(this.from.blockchain).address;

        const fromWithoutFee = getFromWithoutFee(
            this.from,
            this.feeInfo.rubicProxy?.platformFee?.percent
        );

        const exchangeParams: SimpleSwapExchangeRequest = {
            amount: fromWithoutFee.tokenAmount.toFixed(),
            tickerFrom: this.fromCurrency.ticker,
            tickerTo: this.toCurrency.ticker,
            networkFrom: this.fromCurrency.network,
            networkTo: this.toCurrency.network,
            fixed: true,
            addressTo: receiverAddress,
            rateId: null,
            customFee: null,
            extraIdTo: '',
            userRefundAddress: walletAddress || '',
            userRefundExtraId: ''
        };

        const { result: exchnage } = await SimpleSwapApiService.createExchange(exchangeParams);

        const extraInfo =
            exchnage.extraIdFrom && this.fromCurrency.hasExtraId
                ? {
                      depositExtraId: exchnage.extraIdFrom,
                      depositExtraIdName: this.fromCurrency.extraId
                  }
                : undefined;

        return {
            id: exchnage.id,
            toAmount: exchnage.amountTo,
            depositAddress: exchnage.addressFrom,
            ...(extraInfo && { ...extraInfo })
        };
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
}
