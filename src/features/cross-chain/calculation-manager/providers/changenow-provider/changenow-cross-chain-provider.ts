import BigNumber from 'bignumber.js';
import { MaxAmountError, MinAmountError, NotSupportedTokensError } from 'src/common/errors';
import { nativeTokensList, PriceToken, PriceTokenAmount, Token } from 'src/common/tokens';
import { compareAddresses } from 'src/common/utils/blockchain';
import {
    BLOCKCHAIN_NAME,
    BlockchainName,
    EvmBlockchainName
} from 'src/core/blockchain/models/blockchain-name';
import { BlockchainsInfo } from 'src/core/blockchain/utils/blockchains-info/blockchains-info';
import { Web3PublicSupportedBlockchain } from 'src/core/blockchain/web3-public-service/models/web3-public-storage';
import { EvmWeb3Pure } from 'src/core/blockchain/web3-pure/typed-web3-pure/evm-web3-pure/evm-web3-pure';
import { Injector } from 'src/core/injector/injector';
import { changenowApiKey } from 'src/features/common/providers/changenow/constants/changenow-api-key';
import { getFromWithoutFee } from 'src/features/common/utils/get-from-without-fee';
import { RequiredCrossChainOptions } from 'src/features/cross-chain/calculation-manager/models/cross-chain-options';
import { CROSS_CHAIN_TRADE_TYPE } from 'src/features/cross-chain/calculation-manager/models/cross-chain-trade-type';
import { CbridgeCrossChainSupportedBlockchain } from 'src/features/cross-chain/calculation-manager/providers/cbridge/constants/cbridge-supported-blockchains';
import { ChangenowCrossChainTrade } from 'src/features/cross-chain/calculation-manager/providers/changenow-provider/changenow-cross-chain-trade';
import {
    changenowApiBlockchain,
    ChangenowCrossChainSupportedBlockchain
} from 'src/features/cross-chain/calculation-manager/providers/changenow-provider/constants/changenow-api-blockchain';
import {
    ChangenowProxySupportedBlockchain,
    changenowProxySupportedBlockchains
} from 'src/features/cross-chain/calculation-manager/providers/changenow-provider/constants/changenow-proxy-supported-blockchains';
import { nativeTokensData } from 'src/features/cross-chain/calculation-manager/providers/changenow-provider/constants/native-addresses';
import {
    ChangenowCurrenciesResponse,
    ChangenowCurrency
} from 'src/features/cross-chain/calculation-manager/providers/changenow-provider/models/changenow-currencies-api';
import {
    ChangenowEstimatedAmountResponse,
    ChangenowRangeResponse
} from 'src/features/cross-chain/calculation-manager/providers/changenow-provider/models/changenow-exchange-api';
import { ChangenowTrade } from 'src/features/cross-chain/calculation-manager/providers/changenow-provider/models/changenow-trade';
import { CrossChainProvider } from 'src/features/cross-chain/calculation-manager/providers/common/cross-chain-provider';
import { CalculationResult } from 'src/features/cross-chain/calculation-manager/providers/common/models/calculation-result';
import { FeeInfo } from 'src/features/cross-chain/calculation-manager/providers/common/models/fee-info';
import { ProxyCrossChainEvmTrade } from 'src/features/cross-chain/calculation-manager/providers/common/proxy-cross-chain-evm-facade/proxy-cross-chain-evm-trade';
import { typedTradeProviders } from 'src/features/on-chain/calculation-manager/constants/trade-providers/typed-trade-providers';
import { EvmOnChainTrade } from 'src/features/on-chain/calculation-manager/providers/common/on-chain-trade/evm-on-chain-trade/evm-on-chain-trade';

export class ChangenowCrossChainProvider extends CrossChainProvider {
    public readonly type = CROSS_CHAIN_TRADE_TYPE.CHANGENOW;

    public isSupportedBlockchain(
        blockchain: BlockchainName
    ): blockchain is ChangenowCrossChainSupportedBlockchain {
        return Object.keys(changenowApiBlockchain).includes(blockchain);
    }

    public isSupportedProxyBlockchain(
        blockchain: BlockchainName
    ): blockchain is ChangenowProxySupportedBlockchain {
        return changenowProxySupportedBlockchains.some(
            supportedBlockchain => supportedBlockchain === blockchain
        );
    }

    // eslint-disable-next-line complexity
    public async calculate(
        from: PriceTokenAmount,
        toToken: PriceToken,
        options: RequiredCrossChainOptions
    ): Promise<CalculationResult> {
        const fromBlockchain = from.blockchain;
        const toBlockchain = toToken.blockchain;

        const useProxy =
            (options?.useProxy?.[this.type] && this.isSupportedProxyBlockchain(fromBlockchain)) ||
            false;

        if (
            !this.areSupportedBlockchains(fromBlockchain, toBlockchain) ||
            (!options.changenowFullyEnabled && !BlockchainsInfo.isEvmBlockchainName(fromBlockchain))
        ) {
            return {
                trade: null,
                error: new NotSupportedTokensError(),
                tradeType: this.type
            };
        }

        const { fromCurrency, toCurrency, transitCurrency, nativeCurrency } =
            await this.getChangenowCurrencies(
                from as Token<ChangenowCrossChainSupportedBlockchain>,
                toToken as Token<ChangenowCrossChainSupportedBlockchain>
            );
        if (!toCurrency || (!fromCurrency && !transitCurrency && !nativeCurrency)) {
            return {
                trade: null,
                error: new NotSupportedTokensError(),
                tradeType: this.type
            };
        }

        const feeInfo = await this.getFeeInfo(
            fromBlockchain as unknown as EvmBlockchainName,
            options.providerAddress,
            from,
            useProxy
        );
        const fromWithoutFee = getFromWithoutFee(from, feeInfo.rubicProxy?.platformFee?.percent);

        let onChainTrade: EvmOnChainTrade | null = null;
        let transitMinAmount = fromWithoutFee.tokenAmount;
        let transitFromToken = fromWithoutFee;

        if (!fromCurrency) {
            if (!useProxy) {
                return {
                    trade: null,
                    error: new NotSupportedTokensError(),
                    tradeType: this.type
                };
            }
            onChainTrade = transitCurrency
                ? await this.getOnChainTrade(
                      fromWithoutFee,
                      [],
                      0.02,
                      transitCurrency.tokenContract!
                  )
                : null;
            if (!onChainTrade) {
                onChainTrade = await this.getOnChainTrade(
                    fromWithoutFee,
                    [],
                    options.slippageTolerance,
                    nativeTokensList[fromBlockchain].address
                );
            }
            if (!onChainTrade) {
                return {
                    trade: null,
                    error: new NotSupportedTokensError(),
                    tradeType: this.type
                };
            }

            transitMinAmount = onChainTrade.toTokenAmountMin.tokenAmount;
            transitFromToken = onChainTrade.to;
        }
        const transit = onChainTrade ? transitCurrency! || nativeCurrency! : fromCurrency!;

        try {
            const toAmount = await this.getToAmount(transit, toCurrency, transitMinAmount);

            const to = new PriceTokenAmount({
                ...toToken.asStruct,
                tokenAmount: toAmount
            }) as PriceTokenAmount<ChangenowCrossChainSupportedBlockchain>;
            const changenowTrade: ChangenowTrade = {
                from: from as PriceTokenAmount<ChangenowCrossChainSupportedBlockchain>,
                to,
                toTokenAmountMin: toAmount,
                fromCurrency: transit,
                toCurrency,
                feeInfo,
                gasData: null,
                onChainTrade
            };
            const gasData =
                options.gasCalculation === 'enabled' && options.receiverAddress
                    ? await ChangenowCrossChainTrade.getGasData(
                          changenowTrade,
                          options.receiverAddress
                      )
                    : null;
            const trade = new ChangenowCrossChainTrade(
                { ...changenowTrade, gasData },
                options.providerAddress
            );

            const error = await this.checkMinMaxAmounts(transitFromToken, transit, toCurrency);
            if (error) {
                return {
                    trade,
                    error,
                    tradeType: this.type
                };
            }

            return { trade, tradeType: this.type };
        } catch {
            const error = await this.checkMinMaxAmounts(transitFromToken, transit, toCurrency);
            if (error) {
                return {
                    trade: null,
                    error,
                    tradeType: this.type
                };
            }
            return {
                trade: null,
                error: new NotSupportedTokensError(),
                tradeType: this.type
            };
        }
    }

    private async getChangenowCurrencies(
        from: Token<ChangenowCrossChainSupportedBlockchain>,
        to: Token<ChangenowCrossChainSupportedBlockchain>
    ): Promise<{
        fromCurrency?: ChangenowCurrency;
        toCurrency?: ChangenowCurrency;
        nativeCurrency?: ChangenowCurrency;
        transitCurrency?: ChangenowCurrency;
    }> {
        const currencies = await Injector.httpClient.get<ChangenowCurrenciesResponse>(
            'https://api.changenow.io/v2/exchange/currencies?active=true&flow=standard',
            { headers: { 'x-changenow-api-key': changenowApiKey } }
        );

        const nativeToken = nativeTokensList[
            from.blockchain
        ] as Token<ChangenowCrossChainSupportedBlockchain>;

        return {
            fromCurrency: this.getCurrency(currencies, from),
            toCurrency: this.getCurrency(currencies, to),
            nativeCurrency: this.getCurrency(currencies, nativeToken),
            transitCurrency: this.getTransitCurrency(currencies, from.blockchain)
        };
    }

    private async checkMinMaxAmounts(
        from: PriceTokenAmount,
        fromCurrency: ChangenowCurrency,
        toCurrency: ChangenowCurrency
    ): Promise<MinAmountError | MaxAmountError | null> {
        const { minAmount, maxAmount } = await this.getMinMaxRange(fromCurrency, toCurrency);
        if (minAmount.gt(from.tokenAmount)) {
            return new MinAmountError(minAmount, from.symbol);
        }
        if (maxAmount?.lt(from.tokenAmount)) {
            return new MaxAmountError(maxAmount, from.symbol);
        }
        return null;
    }

    private isNativeAddress(
        token: Token<ChangenowCrossChainSupportedBlockchain>,
        currency: ChangenowCurrency
    ): boolean {
        return nativeTokensData.some(
            nativeTokenData =>
                token.blockchain === nativeTokenData.blockchain &&
                compareAddresses(nativeTokenData.address, token.address) &&
                currency.network === changenowApiBlockchain[nativeTokenData.blockchain] &&
                currency.ticker === nativeTokenData.ticker
        );
    }

    private async getToAmount(
        fromCurrency: ChangenowCurrency,
        toCurrency: ChangenowCurrency,
        fromAmount: BigNumber
    ): Promise<BigNumber> {
        const response = await Injector.httpClient.get<ChangenowEstimatedAmountResponse>(
            `https://api.changenow.io/v2/exchange/estimated-amount?flow=standard`,
            {
                params: {
                    fromCurrency: fromCurrency.ticker,
                    toCurrency: toCurrency.ticker,
                    fromAmount: fromAmount.toFixed(),
                    fromNetwork: fromCurrency.network,
                    toNetwork: toCurrency.network
                },
                headers: {
                    'x-changenow-api-key': changenowApiKey
                }
            }
        );
        return new BigNumber(response.toAmount);
    }

    private async getMinMaxRange(
        fromCurrency: ChangenowCurrency,
        toCurrency: ChangenowCurrency
    ): Promise<{ minAmount: BigNumber; maxAmount: BigNumber | null }> {
        const response = await Injector.httpClient.get<ChangenowRangeResponse>(
            `https://api.changenow.io/v2/exchange/range?flow=standard`,
            {
                params: {
                    fromCurrency: fromCurrency.ticker,
                    toCurrency: toCurrency.ticker,
                    fromNetwork: fromCurrency.network,
                    toNetwork: toCurrency.network
                },
                headers: {
                    'x-changenow-api-key': changenowApiKey
                }
            }
        );
        return {
            minAmount: new BigNumber(response.minAmount),
            maxAmount: response.maxAmount ? new BigNumber(response.maxAmount) : null
        };
    }

    protected override async getFeeInfo(
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

    private async getOnChainTrade(
        from: PriceTokenAmount,
        _availableDexes: string[],
        slippageTolerance: number,
        transitTokenAddress: string
    ): Promise<EvmOnChainTrade | null> {
        const fromBlockchain = from.blockchain as CbridgeCrossChainSupportedBlockchain;

        const dexes = Object.values(typedTradeProviders[fromBlockchain]).filter(
            dex => dex.supportReceiverAddress
        );
        const to = await PriceToken.createToken({
            address: transitTokenAddress,
            blockchain: fromBlockchain
        });
        const onChainTrades = (
            await Promise.allSettled(
                dexes.map(dex =>
                    dex.calculate(from, to, {
                        slippageTolerance,
                        gasCalculation: 'disabled',
                        useProxy: false
                    })
                )
            )
        )
            .filter(value => value.status === 'fulfilled')
            .map(value => (value as PromiseFulfilledResult<EvmOnChainTrade>).value)
            .sort((a, b) => b.to.tokenAmount.comparedTo(a.to.tokenAmount));

        if (!onChainTrades.length) {
            return null;
        }
        return onChainTrades[0]!;
    }

    private getCurrency(
        currencies: ChangenowCurrenciesResponse,
        token: Token<ChangenowCrossChainSupportedBlockchain>
    ): ChangenowCurrency | undefined {
        if (!token) {
            return undefined;
        }
        const apiBlockchain =
            token.blockchain === BLOCKCHAIN_NAME.AVALANCHE &&
            EvmWeb3Pure.isNativeAddress(token.address)
                ? 'cchain'
                : changenowApiBlockchain[token.blockchain];

        return currencies.find(
            currency =>
                currency.network === apiBlockchain &&
                ((currency.tokenContract === null &&
                    (token.isNative || this.isNativeAddress(token, currency))) ||
                    (currency.tokenContract &&
                        compareAddresses(token.address, currency.tokenContract)))
        );
    }

    private getTransitCurrency(
        currencies: ChangenowCurrenciesResponse,
        blockchain: ChangenowCrossChainSupportedBlockchain
    ): ChangenowCurrency | undefined {
        const apiBlockchain = changenowApiBlockchain[blockchain];
        return currencies.find(
            currency => currency.network === apiBlockchain && currency.tokenContract !== null
        );
    }
}
