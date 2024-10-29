import BigNumber from 'bignumber.js';
import { MaxAmountError, MinAmountError, NotSupportedTokensError } from 'src/common/errors';
import { PriceToken, PriceTokenAmount } from 'src/common/tokens';
import { compareAddresses } from 'src/common/utils/blockchain';
import { BlockchainName, EvmBlockchainName } from 'src/core/blockchain/models/blockchain-name';
import { Web3PublicSupportedBlockchain } from 'src/core/blockchain/web3-public-service/models/web3-public-storage';
import { EvmEncodeConfig } from 'src/core/blockchain/web3-pure/typed-web3-pure/evm-web3-pure/models/evm-encode-config';
import { getFromWithoutFee } from 'src/features/common/utils/get-from-without-fee';

import { RequiredCrossChainOptions } from '../../models/cross-chain-options';
import { CROSS_CHAIN_TRADE_TYPE } from '../../models/cross-chain-trade-type';
import { CrossChainProvider } from '../common/cross-chain-provider';
import { CrossChainTransferTrade } from '../common/cross-chain-transfer-trade/cross-chain-transfer-trade';
import { CalculationResult } from '../common/models/calculation-result';
import { FeeInfo } from '../common/models/fee-info';
import { RubicStep } from '../common/models/rubicStep';
import { ProxyCrossChainEvmTrade } from '../common/proxy-cross-chain-evm-facade/proxy-cross-chain-evm-trade';
import {
    simpleSwapApiChain,
    SimpleSwapCcrSupportedChain
} from './constants/simple-swap-ccr-api-blockchain';
import { simpleSwapCcrProxySupportedChains } from './constants/simple-swap-ccr-supported-chains';
import { SimpleSwapCurrency } from './models/simple-swap-currency';
import { SimpleSwapApiService } from './services/simple-swap-api-service';
import { SimpleSwapCcrTrade } from './simple-swap-ccr-trade';

export class SimpleSwapCcrProvider extends CrossChainProvider {
    public readonly type = CROSS_CHAIN_TRADE_TYPE.SIMPLE_SWAP;

    public isSupportedBlockchain(fromBlockchain: BlockchainName): boolean {
        return Object.keys(simpleSwapApiChain).includes(fromBlockchain);
    }

    private isProxySupportedChain(fromBlockchain: BlockchainName): boolean {
        return simpleSwapCcrProxySupportedChains.some(
            supportedChain => supportedChain === fromBlockchain
        );
    }

    public async calculate(
        from: PriceTokenAmount,
        toToken: PriceToken,
        options: RequiredCrossChainOptions
    ): Promise<CalculationResult<EvmEncodeConfig>> {
        const useProxy =
            this.isProxySupportedChain(from.blockchain) &&
            (options?.useProxy?.[this.type] || false);

        try {
            const { fromCurrency, toCurrency } = await this.getSimpleSwapCurrencies(from, toToken);

            if (!fromCurrency || !toCurrency) {
                return {
                    trade: null,
                    error: new NotSupportedTokensError(),
                    tradeType: this.type
                };
            }

            const toBlockchain = toToken.blockchain as SimpleSwapCcrSupportedChain;

            const feeInfo = await this.getFeeInfo(
                from.blockchain as Web3PublicSupportedBlockchain,
                options.providerAddress,
                from,
                useProxy
            );

            const minMaxError = await this.checkMinMaxErrors(
                from,
                toBlockchain,
                fromCurrency.ticker,
                toCurrency.ticker
            );

            if (minMaxError) {
                const emptyTrade = this.getEmptyTrade(
                    from,
                    toToken,
                    fromCurrency,
                    toCurrency,
                    feeInfo,
                    options.providerAddress
                );

                return {
                    trade: emptyTrade,
                    error: minMaxError,
                    tradeType: this.type
                };
            }

            const fromWithoutFee = getFromWithoutFee(
                from,
                feeInfo.rubicProxy?.platformFee?.percent
            );

            const toAmount = await SimpleSwapApiService.getEstimation({
                tickerFrom: fromCurrency.ticker,
                tickerTo: toCurrency.ticker,
                networkFrom: fromCurrency.network,
                networkTo: toCurrency.network,
                fixed: false,
                amount: fromWithoutFee.tokenAmount.toFixed()
            });

            const to = new PriceTokenAmount({
                ...toToken.asStruct,
                tokenAmount: new BigNumber(toAmount)
            });

            const routePath = await this.getRoutePath(from, to);

            const gasData =
                options.gasCalculation === 'enabled'
                    ? await CrossChainTransferTrade.getGasData(from)
                    : null;
            const trade = new SimpleSwapCcrTrade(
                {
                    from: from as PriceTokenAmount<EvmBlockchainName>,
                    to: to as PriceTokenAmount<SimpleSwapCcrSupportedChain>,
                    gasData,
                    feeInfo,
                    priceImpact: from.calculatePriceImpactPercent(to),
                    fromCurrency,
                    toCurrency
                },
                options.providerAddress,
                routePath,
                useProxy
            );

            return {
                trade,
                tradeType: this.type
            };
        } catch (error) {
            return {
                trade: null,
                tradeType: this.type,
                error
            };
        }
    }

    protected async getRoutePath(
        from: PriceTokenAmount,
        to: PriceTokenAmount
    ): Promise<RubicStep[]> {
        return [
            {
                type: 'cross-chain',
                provider: CROSS_CHAIN_TRADE_TYPE.SIMPLE_SWAP,
                path: [from, to]
            }
        ];
    }

    private getEmptyTrade(
        from: PriceTokenAmount,
        toToken: PriceToken,
        fromCurrency: SimpleSwapCurrency,
        toCurrency: SimpleSwapCurrency,
        feeInfo: FeeInfo,
        providerAddress: string
    ): SimpleSwapCcrTrade {
        const to = new PriceTokenAmount({
            ...toToken.asStruct,
            tokenAmount: new BigNumber(0)
        });
        return new SimpleSwapCcrTrade(
            {
                from: from as PriceTokenAmount<EvmBlockchainName>,
                to: to as PriceTokenAmount<SimpleSwapCcrSupportedChain>,
                fromCurrency,
                toCurrency,
                feeInfo,
                priceImpact: null,
                gasData: null
            },
            providerAddress,
            [],
            false
        );
    }

    private async getSimpleSwapCurrencies(
        fromToken: PriceToken,
        toToken: PriceToken
    ): Promise<{ fromCurrency?: SimpleSwapCurrency; toCurrency?: SimpleSwapCurrency }> {
        const { result: currencies } = await SimpleSwapApiService.getAllCurrencies();

        return {
            fromCurrency: this.getCurrency(
                currencies,
                fromToken as PriceToken<SimpleSwapCcrSupportedChain>
            ),
            toCurrency: this.getCurrency(
                currencies,
                toToken as PriceToken<SimpleSwapCcrSupportedChain>
            )
        };
    }

    private getCurrency(
        currencies: SimpleSwapCurrency[],
        token: PriceToken<SimpleSwapCcrSupportedChain>
    ): SimpleSwapCurrency | undefined {
        const apiChain = simpleSwapApiChain[token.blockchain];

        return currencies.find(
            currency =>
                currency.network === apiChain &&
                ((currency.contractAddress &&
                    compareAddresses(currency.contractAddress, token.address)) ||
                    (token.isNative && !currency.contractAddress))
        );
    }

    private async checkMinMaxErrors(
        fromToken: PriceTokenAmount,
        toBlockchain: SimpleSwapCcrSupportedChain,
        fromCurrency: string,
        toCurrency: string
    ): Promise<MinAmountError | MaxAmountError | null> {
        const fromBlockchain = fromToken.blockchain as SimpleSwapCcrSupportedChain;

        const { min, max } = await SimpleSwapApiService.getRanges({
            fixed: false,
            tickerFrom: fromCurrency,
            tickerTo: toCurrency,
            networkFrom: simpleSwapApiChain[fromBlockchain],
            networkTo: simpleSwapApiChain[toBlockchain]
        });

        const minAmount = new BigNumber(min);

        if (fromToken.tokenAmount.lt(minAmount)) {
            return new MinAmountError(minAmount, fromToken.symbol);
        }

        if (max) {
            const maxAmount = new BigNumber(max);

            if (fromToken.tokenAmount.gt(maxAmount)) {
                return new MaxAmountError(maxAmount, fromToken.symbol);
            }
        }
        return null;
    }

    protected async getFeeInfo(
        fromBlockchain: Web3PublicSupportedBlockchain,
        providerAddress: string,
        percentFeeToken: PriceTokenAmount,
        useProxy: boolean
    ): Promise<FeeInfo> {
        return ProxyCrossChainEvmTrade.getFeeInfo(
            fromBlockchain,
            providerAddress,
            percentFeeToken,
            useProxy
        );
    }
}
