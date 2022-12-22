import BigNumber from 'bignumber.js';
import { MaxAmountError, MinAmountError, RubicSdkError } from 'src/common/errors';
import { nativeTokensList, PriceToken, PriceTokenAmount, Token } from 'src/common/tokens';
import { compareAddresses } from 'src/common/utils/blockchain';
import { BlockchainName } from 'src/core/blockchain/models/blockchain-name';
import { Injector } from 'src/core/injector/injector';
import { changenowApiKey } from 'src/features/common/providers/changenow/constants/changenow-api-key';
import { RequiredCrossChainOptions } from 'src/features/cross-chain/calculation-manager/models/cross-chain-options';
import { CROSS_CHAIN_TRADE_TYPE } from 'src/features/cross-chain/calculation-manager/models/cross-chain-trade-type';
import { ChangenowCrossChainTrade } from 'src/features/cross-chain/calculation-manager/providers/changenow-provider/changenow-cross-chain-trade';
import { changenowApiBlockchain } from 'src/features/cross-chain/calculation-manager/providers/changenow-provider/constants/changenow-api-blockchain';
import {
    ChangenowCrossChainFromSupportedBlockchain,
    changenowCrossChainFromSupportedBlockchains,
    ChangenowCrossChainSupportedBlockchain,
    ChangenowCrossChainToSupportedBlockchain,
    changenowCrossChainToSupportedBlockchains
} from 'src/features/cross-chain/calculation-manager/providers/changenow-provider/models/changenow-cross-chain-supported-blockchain';
import {
    ChangenowCurrenciesResponse,
    ChangenowCurrency
} from 'src/features/cross-chain/calculation-manager/providers/changenow-provider/models/changenow-currencies-api';
import {
    ChangenowEstimatedAmountResponse,
    ChangenowExchangeResponse,
    ChangenowRangeResponse
} from 'src/features/cross-chain/calculation-manager/providers/changenow-provider/models/changenow-exchange-api';
import { ChangenowTrade } from 'src/features/cross-chain/calculation-manager/providers/changenow-provider/models/changenow-trade';
import { rubicProxyContractAddress } from 'src/features/cross-chain/calculation-manager/providers/common/constants/rubic-proxy-contract-address';
import { CrossChainProvider } from 'src/features/cross-chain/calculation-manager/providers/common/cross-chain-provider';
import { evmCommonCrossChainAbi } from 'src/features/cross-chain/calculation-manager/providers/common/emv-cross-chain-trade/constants/evm-common-cross-chain-abi';
import { CalculationResult } from 'src/features/cross-chain/calculation-manager/providers/common/models/calculation-result';
import { FeeInfo } from 'src/features/cross-chain/calculation-manager/providers/common/models/fee-info';

export class ChangenowCrossChainProvider extends CrossChainProvider {
    readonly type = CROSS_CHAIN_TRADE_TYPE.CHANGENOW;

    public isSupportedBlockchain(
        blockchain: BlockchainName
    ): blockchain is ChangenowCrossChainSupportedBlockchain {
        return (
            changenowCrossChainFromSupportedBlockchains.some(
                supportedBlockchain => supportedBlockchain === blockchain
            ) ||
            changenowCrossChainToSupportedBlockchains.some(
                supportedBlockchain => supportedBlockchain === blockchain
            )
        );
    }

    public override areSupportedBlockchains(
        fromBlockchain: BlockchainName,
        toBlockchain: BlockchainName
    ): boolean {
        return (
            changenowCrossChainFromSupportedBlockchains.some(
                supportedBlockchain => supportedBlockchain === fromBlockchain
            ) &&
            changenowCrossChainToSupportedBlockchains.some(
                supportedBlockchain => supportedBlockchain === toBlockchain
            )
        );
    }

    public async calculate(
        from: PriceTokenAmount,
        toToken: PriceToken,
        options: RequiredCrossChainOptions
    ): Promise<CalculationResult> {
        const fromBlockchain = from.blockchain as ChangenowCrossChainFromSupportedBlockchain;
        const toBlockchain = toToken.blockchain as ChangenowCrossChainToSupportedBlockchain;
        if (!this.areSupportedBlockchains(fromBlockchain, toBlockchain)) {
            return null;
        }

        const { fromCurrency, toCurrency } = await this.getChangenowCurrencies(
            from as Token<ChangenowCrossChainSupportedBlockchain>,
            toToken as Token<ChangenowCrossChainSupportedBlockchain>
        );
        if (!fromCurrency || !toCurrency) {
            return null;
        }

        // todo return
        /*
        await this.checkContractState(
            fromBlockchain,
            rubicProxyContractAddress[fromBlockchain],
            evmCommonCrossChainAbi
        );

        const feeInfo = await this.getFeeInfo(fromBlockchain, options.providerAddress, from);
        const fromWithoutFee = getFromWithoutFee(from, feeInfo.rubicProxy?.platformFee?.percent);
         */

        const [toAmount, { minAmount, maxAmount }] = await Promise.all([
            this.getToAmount(fromCurrency, toCurrency, from.tokenAmount),
            this.getMinMaxRange(fromCurrency, toCurrency)
        ]);

        const to = new PriceTokenAmount({
            ...toToken.asStruct,
            tokenAmount: toAmount
        }) as PriceTokenAmount<ChangenowCrossChainToSupportedBlockchain>;
        const changenowTrade: ChangenowTrade = {
            from: from as PriceTokenAmount<ChangenowCrossChainFromSupportedBlockchain>,
            to,
            toTokenAmountMin: to.tokenAmount,

            id: undefined,
            payingAddress: undefined,
            receiverAddress: undefined,

            feeInfo: {},
            gasData: null
        };
        const gasData =
            options.gasCalculation === 'enabled' && options.receiverAddress
                ? await ChangenowCrossChainTrade.getGasData(changenowTrade, options.receiverAddress)
                : null;

        const changenowCrossChainTrade = new ChangenowCrossChainTrade(
            { ...changenowTrade, gasData },
            options.providerAddress
        );
        if (minAmount.gt(from.tokenAmount)) {
            return {
                trade: changenowCrossChainTrade,
                error: new MinAmountError(minAmount, from.symbol)
            };
        }
        if (maxAmount?.lt(from.tokenAmount)) {
            return {
                trade: changenowCrossChainTrade,
                error: new MaxAmountError(maxAmount, from.symbol)
            };
        }
        if (!options.receiverAddress) {
            return {
                trade: changenowCrossChainTrade,
                error: new RubicSdkError('`receiverAddress` option is required')
            };
        }

        const { id, payinAddress: payingAddress } = await this.getPaymentInfo(
            fromCurrency,
            toCurrency,
            from.tokenAmount,
            options.receiverAddress
        );
        return {
            trade: new ChangenowCrossChainTrade(
                {
                    ...changenowTrade,
                    gasData,
                    id,
                    payingAddress,
                    receiverAddress: options.receiverAddress
                },
                options.providerAddress
            )
        };
    }

    private async getChangenowCurrencies(
        from: Token<ChangenowCrossChainSupportedBlockchain>,
        to: Token<ChangenowCrossChainSupportedBlockchain>
    ): Promise<{ fromCurrency?: ChangenowCurrency; toCurrency?: ChangenowCurrency }> {
        const currencies = await Injector.httpClient.get<ChangenowCurrenciesResponse>(
            'https://api.changenow.io/v2/exchange/currencies?active=true&flow=standard',
            {
                headers: {
                    'x-changenow-api-key': changenowApiKey
                }
            }
        );

        const getCurrency = (
            token: Token<ChangenowCrossChainSupportedBlockchain>
        ): ChangenowCurrency | undefined => {
            const apiBlockchain = changenowApiBlockchain[token.blockchain];
            return currencies.find(
                currency =>
                    currency.network === apiBlockchain &&
                    ((token.isNative && currency.tokenContract === null) ||
                        (currency.tokenContract &&
                            compareAddresses(token.address, currency.tokenContract)))
            );
        };

        return {
            fromCurrency: getCurrency(from),
            toCurrency: getCurrency(to)
        };
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
            `https://api.changenow.io/v2/exchange/estimated-amount?flow=standard`,
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

    private async getPaymentInfo(
        fromCurrency: ChangenowCurrency,
        toCurrency: ChangenowCurrency,
        fromAmount: BigNumber,
        receiverAddress: string
    ): Promise<ChangenowExchangeResponse> {
        return Injector.httpClient.post<ChangenowExchangeResponse>(
            'https://api.changenow.io/v2/exchange',
            {
                fromCurrency: fromCurrency.ticker,
                toCurrency: toCurrency.ticker,
                fromNetwork: fromCurrency.network,
                toNetwork: toCurrency.network,
                fromAmount: fromAmount.toFixed(),
                address: receiverAddress,
                flow: 'standard'
            },
            {
                headers: {
                    'x-changenow-api-key': changenowApiKey
                }
            }
        );
    }

    protected override async getFeeInfo(
        fromBlockchain: ChangenowCrossChainFromSupportedBlockchain,
        providerAddress: string,
        percentFeeToken: PriceTokenAmount
    ): Promise<FeeInfo> {
        return {
            rubicProxy: {
                fixedFee: {
                    amount: await this.getFixedFee(
                        fromBlockchain,
                        providerAddress,
                        rubicProxyContractAddress[fromBlockchain],
                        evmCommonCrossChainAbi
                    ),
                    tokenSymbol: nativeTokensList[fromBlockchain].symbol
                },
                platformFee: {
                    percent: await this.getFeePercent(
                        fromBlockchain,
                        providerAddress,
                        rubicProxyContractAddress[fromBlockchain],
                        evmCommonCrossChainAbi
                    ),
                    tokenSymbol: percentFeeToken.symbol
                }
            }
        };
    }
}
