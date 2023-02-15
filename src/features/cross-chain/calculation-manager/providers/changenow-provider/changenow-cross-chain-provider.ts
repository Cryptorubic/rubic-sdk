import BigNumber from 'bignumber.js';
import { MaxAmountError, MinAmountError } from 'src/common/errors';
import { nativeTokensList, PriceToken, PriceTokenAmount, Token } from 'src/common/tokens';
import { compareAddresses } from 'src/common/utils/blockchain';
import { BLOCKCHAIN_NAME, BlockchainName } from 'src/core/blockchain/models/blockchain-name';
import { BlockchainsInfo } from 'src/core/blockchain/utils/blockchains-info/blockchains-info';
import { Web3PublicSupportedBlockchain } from 'src/core/blockchain/web3-public-service/models/web3-public-storage';
import { EvmWeb3Pure } from 'src/core/blockchain/web3-pure/typed-web3-pure/evm-web3-pure/evm-web3-pure';
import { Injector } from 'src/core/injector/injector';
import { changenowApiKey } from 'src/features/common/providers/changenow/constants/changenow-api-key';
import { RequiredCrossChainOptions } from 'src/features/cross-chain/calculation-manager/models/cross-chain-options';
import { CROSS_CHAIN_TRADE_TYPE } from 'src/features/cross-chain/calculation-manager/models/cross-chain-trade-type';
import { ChangenowCrossChainTrade } from 'src/features/cross-chain/calculation-manager/providers/changenow-provider/changenow-cross-chain-trade';
import {
    changenowApiBlockchain,
    ChangenowCrossChainSupportedBlockchain
} from 'src/features/cross-chain/calculation-manager/providers/changenow-provider/constants/changenow-api-blockchain';
import {
    celoNativeAddress,
    optimismNativeAddress
} from 'src/features/cross-chain/calculation-manager/providers/changenow-provider/constants/native-addresses';
import {
    ChangenowCurrenciesResponse,
    ChangenowCurrency
} from 'src/features/cross-chain/calculation-manager/providers/changenow-provider/models/changenow-currencies-api';
import {
    ChangenowEstimatedAmountResponse,
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
        return Object.keys(changenowApiBlockchain).includes(blockchain);
    }

    public async calculate(
        from: PriceTokenAmount,
        toToken: PriceToken,
        options: RequiredCrossChainOptions
    ): Promise<CalculationResult> {
        const fromBlockchain = from.blockchain;
        const toBlockchain = toToken.blockchain;
        if (
            !this.areSupportedBlockchains(fromBlockchain, toBlockchain) ||
            (!options.changenowFullyEnabled && !BlockchainsInfo.isEvmBlockchainName(fromBlockchain))
        ) {
            return null;
        }

        const { fromCurrency, toCurrency } = await this.getChangenowCurrencies(
            from as Token<ChangenowCrossChainSupportedBlockchain>,
            toToken as Token<ChangenowCrossChainSupportedBlockchain>
        );
        if (!fromCurrency || !toCurrency) {
            return null;
        }

        // todo return after proxy fix
        /*
        await this.checkContractState(
            fromBlockchain,
            rubicProxyContractAddress[fromBlockchain],
            evmCommonCrossChainAbi
        );

        const feeInfo = await this.getFeeInfo(fromBlockchain, options.providerAddress, from);
        const fromWithoutFee = getFromWithoutFee(from, feeInfo.rubicProxy?.platformFee?.percent);
         */

        try {
            const toAmount = await this.getToAmount(fromCurrency, toCurrency, from.tokenAmount);

            const to = new PriceTokenAmount({
                ...toToken.asStruct,
                tokenAmount: toAmount
            }) as PriceTokenAmount<ChangenowCrossChainSupportedBlockchain>;
            const changenowTrade: ChangenowTrade = {
                from: from as PriceTokenAmount<ChangenowCrossChainSupportedBlockchain>,
                to,
                toTokenAmountMin: to.tokenAmount,
                fromCurrency,
                toCurrency,
                feeInfo: {},
                gasData: null
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

            const error = await this.checkMinMaxAmounts(from, fromCurrency, toCurrency);
            if (error) {
                return {
                    trade,
                    error
                };
            }

            return { trade };
        } catch {
            const error = await this.checkMinMaxAmounts(from, fromCurrency, toCurrency);
            if (error) {
                return {
                    trade: null,
                    error
                };
            }
            return null;
        }
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
        };

        return {
            fromCurrency: getCurrency(from),
            toCurrency: getCurrency(to)
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
        return (
            (token.blockchain === BLOCKCHAIN_NAME.OPTIMISM &&
                token.address === optimismNativeAddress &&
                currency.ticker === 'op') ||
            (token.blockchain === BLOCKCHAIN_NAME.CELO &&
                token.address === celoNativeAddress &&
                currency.ticker === 'celo')
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
