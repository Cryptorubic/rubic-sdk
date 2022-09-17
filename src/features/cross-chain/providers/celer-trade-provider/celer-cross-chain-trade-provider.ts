import {
    CelerCrossChainSupportedBlockchain,
    celerCrossChainSupportedBlockchains
} from 'src/features/cross-chain/providers/celer-trade-provider/models/celer-cross-chain-supported-blockchain';
import { ItCalculatedTrade } from 'src/features/cross-chain/providers/celer-trade-provider/models/it-calculated-trade';
import { BlockchainName, EvmBlockchainName } from 'src/core/blockchain/models/blockchain-name';
import { WrappedCrossChainTrade } from 'src/features/cross-chain/providers/common/models/wrapped-cross-chain-trade';
import { CelerCrossChainContractTrade } from 'src/features/cross-chain/providers/celer-trade-provider/celer-cross-chain-contract-trade/celer-cross-chain-contract-trade';
import { FeeInfo } from 'src/features/cross-chain/providers/common/models/fee';
import { RequiredCrossChainOptions } from 'src/features/cross-chain/models/cross-chain-options';
import { CelerDirectCrossChainContractTrade } from 'src/features/cross-chain/providers/celer-trade-provider/celer-cross-chain-contract-trade/celer-direct-cross-chain-trade/celer-direct-cross-chain-contract-trade';
import {
    CrossChainIsUnavailableError,
    InsufficientLiquidityError,
    RubicSdkError,
    LowToSlippageError,
    CrossChainMinAmountError,
    CrossChainMaxAmountError,
    TooLowAmountError
} from 'src/common/errors';
import { Injector } from 'src/core/injector/injector';
import { wrappedNative } from 'src/features/cross-chain/providers/celer-trade-provider/constants/wrapped-native';
import { EstimateAmtResponse } from 'src/features/cross-chain/providers/celer-trade-provider/models/estimate-amount-response';
import { Web3Pure } from 'src/core/blockchain/web3-pure/web3-pure';
import { getCelerCrossChainContract } from 'src/features/cross-chain/providers/celer-trade-provider/constants/celer-cross-chain-contracts';
import { CelerCrossChainTrade } from 'src/features/cross-chain/providers/celer-trade-provider/celer-cross-chain-trade';
import { notNull } from 'src/common/utils/object';
import { celerCrossChainContractAbi } from 'src/features/cross-chain/providers/celer-trade-provider/constants/celer-cross-chain-contract-abi';
import { UniswapV2AbstractProvider } from 'src/features/instant-trades/dexes/common/uniswap-v2-abstract/uniswap-v2-abstract-provider';
import { PriceToken, PriceTokenAmount, Token } from 'src/common/tokens';
import { TRADE_TYPE, TradeType } from 'src/features/instant-trades/models/trade-type';
import { CROSS_CHAIN_TRADE_TYPE } from 'src/features/cross-chain/models/cross-chain-trade-type';
import { CelerItCrossChainContractTrade } from 'src/features/cross-chain/providers/celer-trade-provider/celer-cross-chain-contract-trade/celer-it-cross-chain-contract-trade/celer-it-cross-chain-contract-trade';
import { CrossChainTradeProvider } from 'src/features/cross-chain/providers/common/cross-chain-trade-provider';
import { compareAddresses } from 'src/common/utils/blockchain';
import BigNumber from 'bignumber.js';
import { blockchainId } from 'src/core/blockchain/utils/blockchains-info/constants/blockchain-id';
import { MinMaxAmounts } from 'src/features/cross-chain/providers/celer-trade-provider/models/min-max-amounts';
import { CrossChainSupportedInstantTradeProvider } from 'src/features/cross-chain/providers/celer-trade-provider/models/cross-chain-supported-instant-trade';
import { CelerCrossChainContractData } from 'src/features/cross-chain/providers/celer-trade-provider/celer-cross-chain-contract-data';
import { CalculationResult } from 'src/features/cross-chain/providers/common/models/calculation-result';

interface CelerCrossChainOptions extends RequiredCrossChainOptions {
    isUniV2?: boolean;
}

export class CelerCrossChainTradeProvider extends CrossChainTradeProvider {
    public static isSupportedBlockchain(
        blockchain: BlockchainName
    ): blockchain is CelerCrossChainSupportedBlockchain {
        return celerCrossChainSupportedBlockchains.some(
            supportedBlockchain => supportedBlockchain === blockchain
        );
    }

    public readonly type = CROSS_CHAIN_TRADE_TYPE.CELER;

    protected contracts = getCelerCrossChainContract;

    public isSupportedBlockchains(
        fromBlockchain: BlockchainName,
        toBlockchain: BlockchainName
    ): boolean {
        return (
            CelerCrossChainTradeProvider.isSupportedBlockchain(fromBlockchain) &&
            CelerCrossChainTradeProvider.isSupportedBlockchain(toBlockchain)
        );
    }

    public async calculate(
        from: PriceTokenAmount<EvmBlockchainName>,
        to: PriceToken<EvmBlockchainName>,
        options: CelerCrossChainOptions
    ): Promise<CalculationResult> {
        const fromBlockchain = from.blockchain;
        const toBlockchain = to.blockchain;
        if (
            !CelerCrossChainTradeProvider.isSupportedBlockchain(fromBlockchain) ||
            !CelerCrossChainTradeProvider.isSupportedBlockchain(toBlockchain)
        ) {
            return null;
        }

        const [fromTransitToken, toTransitToken] = await Promise.all([
            new PriceToken({
                ...(await this.contracts(fromBlockchain).getTransitToken()),
                price: new BigNumber(1)
            }),
            new PriceToken({
                ...(await this.contracts(toBlockchain).getTransitToken()),
                price: new BigNumber(1)
            })
        ]);

        const { gasCalculation, providerAddress, ...slippages } = options;

        await this.checkContractsState(
            this.contracts(fromBlockchain),
            this.contracts(toBlockchain)
        );

        const fromTrade = await this.calculateBestTrade(
            fromBlockchain,
            from,
            fromTransitToken,
            slippages.fromSlippageTolerance,
            options.isUniV2
        );

        const celerSlippage = await this.fetchCelerSlippage(
            fromBlockchain,
            toBlockchain,
            fromTrade.toTokenAmountMin,
            fromTransitToken
        );

        const { fromSlippageTolerance, toSlippageTolerance: toSlippage } = slippages;
        const toSlippageTolerance = toSlippage - celerSlippage;

        if (toSlippageTolerance < 0) {
            throw new LowToSlippageError();
        }

        const estimateTransitAmountWithSlippage = await this.fetchCelerAmount(
            fromBlockchain,
            toBlockchain,
            fromTrade.toTokenAmountMin,
            fromTransitToken,
            toTransitToken,
            celerSlippage
        );
        if (estimateTransitAmountWithSlippage.lte(0)) {
            return {
                trade: null,
                error: new TooLowAmountError()
            };
        }

        const { toTransitTokenAmount, transitFeeToken, feeInPercents } =
            await this.getToTransitTokenAmount(
                toBlockchain,
                fromTrade.fromToken,
                estimateTransitAmountWithSlippage
            );

        const toTransit = new PriceTokenAmount({
            ...toTransitToken.asStruct,
            tokenAmount: toTransitTokenAmount
        });
        const toTrade = await this.calculateBestTrade(
            toBlockchain,
            toTransit,
            to,
            toSlippageTolerance,
            options.isUniV2,
            [TRADE_TYPE.ONE_INCH]
        );

        let cryptoFeeToken = await fromTrade.contract.getCryptoFeeToken(toTrade.contract);
        let nativeTokenPrice = new BigNumber(0);

        if (cryptoFeeToken.tokenAmount.gt(0)) {
            nativeTokenPrice = (
                await this.getBestItContractTrade(
                    fromBlockchain,
                    new PriceTokenAmount({
                        ...cryptoFeeToken.asStructWithAmount,
                        price: new BigNumber(0)
                    }),
                    fromTransitToken,
                    fromSlippageTolerance
                )
            ).toToken.tokenAmount;
        }
        cryptoFeeToken = new PriceTokenAmount({
            ...cryptoFeeToken.asStructWithAmount,
            price: nativeTokenPrice.dividedBy(cryptoFeeToken.tokenAmount)
        });

        const gasData =
            gasCalculation === 'enabled'
                ? await CelerCrossChainTrade.getGasData(
                      fromTrade,
                      toTrade,
                      cryptoFeeToken,
                      Number.parseInt((celerSlippage * 10 ** 6 * 100).toFixed())
                  )
                : null;

        const trade = new CelerCrossChainTrade(
            {
                fromTrade,
                toTrade,
                cryptoFeeToken,
                transitFeeToken,
                gasData,
                feeInPercents,
                feeInfo: await this.getCelerFeeInfo(
                    feeInPercents,
                    transitFeeToken,
                    cryptoFeeToken,
                    from,
                    providerAddress
                )
            },
            providerAddress,
            Number.parseInt((celerSlippage * 10 ** 6 * 100).toFixed())
        );

        try {
            await this.checkMinMaxAmountsErrors(fromTrade);
        } catch (err: unknown) {
            return {
                trade,
                error: CrossChainTradeProvider.parseError(err)
            };
        }

        return {
            trade
        };
    }

    protected async checkContractsState(
        fromContract: CelerCrossChainContractData,
        toContract: CelerCrossChainContractData
    ): Promise<void> {
        const [sourceContractPaused, targetContractPaused] = await Promise.all([
            fromContract.isPaused(),
            toContract.isPaused()
        ]);

        if (sourceContractPaused || targetContractPaused) {
            throw new CrossChainIsUnavailableError();
        }
    }

    /**
     * Calculates celer bridge slippage.
     * @param fromBlockchain Source blockchain.
     * @param toBlockchain Target blockchain.
     * @param amount Trade amount.
     * @param transitToken Swap transit token.
     * @returns Celer bridge slippage.
     */
    private async fetchCelerSlippage(
        fromBlockchain: CelerCrossChainSupportedBlockchain,
        toBlockchain: CelerCrossChainSupportedBlockchain,
        amount: BigNumber,
        transitToken: PriceToken
    ): Promise<number> {
        const estimate = await this.fetchCelerEstimate(
            fromBlockchain,
            toBlockchain,
            amount,
            transitToken,
            0
        );

        return estimate.max_slippage / 10 ** 6 / 100;
    }

    private async fetchCelerAmount(
        fromBlockchain: CelerCrossChainSupportedBlockchain,
        toBlockchain: CelerCrossChainSupportedBlockchain,
        amount: BigNumber,
        fromTransitToken: PriceToken,
        toTransitToken: PriceToken,
        slippage: number
    ): Promise<BigNumber> {
        const estimate = await this.fetchCelerEstimate(
            fromBlockchain,
            toBlockchain,
            amount,
            fromTransitToken,
            slippage
        );
        const finalAmount = Web3Pure.fromWei(
            estimate.estimated_receive_amt,
            toTransitToken.decimals
        );

        return finalAmount.gt(0) ? finalAmount : new BigNumber(0);
    }

    private async fetchCelerEstimate(
        fromBlockchain: CelerCrossChainSupportedBlockchain,
        toBlockchain: CelerCrossChainSupportedBlockchain,
        amount: BigNumber,
        transitToken: PriceToken,
        slippageTolerance: number
    ): Promise<EstimateAmtResponse> {
        const sourceChainId = blockchainId[fromBlockchain];
        const destinationChainId = blockchainId[toBlockchain];
        // Celer accepts only USDC symbol, USDC.e for avalanche is not allowed.
        const tokenSymbol = transitToken.symbol.toLowerCase().includes('usdc')
            ? 'USDC'
            : transitToken.symbol;
        const params = {
            src_chain_id: sourceChainId,
            dst_chain_id: destinationChainId,
            token_symbol: tokenSymbol,
            slippage_tolerance: new BigNumber(slippageTolerance)
                .multipliedBy(10 ** 6)
                .multipliedBy(100)
                .toFixed(0),
            amt: Web3Pure.toWei(amount, transitToken?.decimals)
        } as const;
        return Injector.httpClient.get<EstimateAmtResponse>(
            `https://cbridge-prod2.celer.network/v2/estimateAmt`,
            { params }
        );
    }

    private async calculateBestTrade(
        blockchain: CelerCrossChainSupportedBlockchain,
        from: PriceTokenAmount<EvmBlockchainName>,
        toToken: PriceToken<EvmBlockchainName>,
        slippageTolerance: number,
        isUniV2?: boolean,
        disabledProviders?: TradeType[]
    ): Promise<CelerCrossChainContractTrade> {
        if (compareAddresses(from.address, toToken.address)) {
            const contract = this.contracts(blockchain);
            if (!from.price.isFinite()) {
                from = new PriceTokenAmount({ ...from.asStructWithAmount, price: toToken.price });
            }

            return new CelerDirectCrossChainContractTrade(blockchain, contract, from);
        }

        return this.getBestItContractTrade(
            blockchain,
            from,
            toToken,
            slippageTolerance,
            isUniV2,
            disabledProviders
        );
    }

    protected async getToTransitTokenAmount(
        toBlockchain: CelerCrossChainSupportedBlockchain,
        transitToken: PriceTokenAmount,
        transitTokenMinAmount: BigNumber
    ): Promise<{
        toTransitTokenAmount: BigNumber;
        transitFeeToken: PriceTokenAmount;
        feeInPercents: number;
    }> {
        const feeInPercents = await this.contracts(toBlockchain).getFeeInPercents();
        const transitFeeToken = new PriceTokenAmount({
            ...transitToken.asStruct,
            tokenAmount: transitTokenMinAmount.multipliedBy(feeInPercents).dividedBy(100)
        });

        const toTransitTokenAmount = transitTokenMinAmount.minus(transitFeeToken.tokenAmount);

        return {
            toTransitTokenAmount,
            transitFeeToken,
            feeInPercents
        };
    }

    private async getItCalculatedTrade(
        contract: CelerCrossChainContractData,
        providerIndex: number,
        from: PriceTokenAmount<EvmBlockchainName>,
        toToken: PriceToken<EvmBlockchainName>,
        slippageTolerance: number
    ): Promise<ItCalculatedTrade> {
        const provider = contract.getProvider(providerIndex);
        const blockchain = from.blockchain as CelerCrossChainSupportedBlockchain;
        const instantTrade = await provider.calculate(from, toToken, {
            gasCalculation: 'disabled',
            slippageTolerance,
            wrappedAddress: wrappedNative[blockchain],
            fromAddress: contract.address
        });
        return {
            toAmount: instantTrade.to.tokenAmount,
            providerIndex,
            instantTrade
        };
    }

    private async getBestItContractTrade(
        blockchain: CelerCrossChainSupportedBlockchain,
        from: PriceTokenAmount<EvmBlockchainName>,
        toToken: PriceToken<EvmBlockchainName>,
        slippageTolerance: number,
        isUniV2?: boolean,
        disabledProviders?: TradeType[]
    ): Promise<CelerItCrossChainContractTrade> {
        const contract = this.contracts(blockchain);
        const promises: Promise<ItCalculatedTrade>[] = contract.providersData
            .filter(data => !disabledProviders?.some(provider => provider === data.provider.type))
            .filter(data => !isUniV2 || data.provider instanceof UniswapV2AbstractProvider)
            .map(async (_, providerIndex) => {
                return this.getItCalculatedTrade(
                    contract,
                    providerIndex,
                    from,
                    toToken,
                    slippageTolerance
                );
            });

        const bestTrade = await Promise.allSettled(promises).then(async results => {
            const sortedResults = results
                .map(result => {
                    if (result.status === 'fulfilled') {
                        return result.value;
                    }
                    return null;
                })
                .filter(notNull)
                .sort((a, b) => b.toAmount.comparedTo(a.toAmount));

            if (!sortedResults.length) {
                throw (results[0] as PromiseRejectedResult).reason;
            }
            return sortedResults[0];
        });

        if (!bestTrade) {
            throw new RubicSdkError(
                `[RUBIC SDK] Can't calculate best trade for with current params.`
            );
        }

        return new CelerItCrossChainContractTrade(
            blockchain,
            contract,
            bestTrade.providerIndex,
            slippageTolerance,
            bestTrade.instantTrade
        );
    }

    private async getCelerFeeInfo(
        feeInPercents: number,
        transitFeeToken: PriceTokenAmount,
        cryptoFeeToken: PriceTokenAmount,
        from: PriceTokenAmount,
        providerAddress: string
    ): Promise<FeeInfo> {
        const fromBlockchain = from.blockchain as CelerCrossChainSupportedBlockchain;
        const fixedFee = {
            amount: await this.getFixedFee(
                fromBlockchain,
                providerAddress,
                this.contracts(fromBlockchain).address,
                celerCrossChainContractAbi
            ),
            tokenSymbol: cryptoFeeToken.symbol
        };
        return {
            fixedFee,
            platformFee: { percent: feeInPercents, tokenSymbol: transitFeeToken.symbol },
            cryptoFee: {
                amount: cryptoFeeToken.tokenAmount,
                tokenSymbol: cryptoFeeToken.symbol
            }
        };
    }

    private async checkMinMaxAmountsErrors(
        fromTrade: CelerCrossChainContractTrade
    ): Promise<void | never> {
        const slippageTolerance =
            fromTrade instanceof CelerItCrossChainContractTrade ? fromTrade.slippage : undefined;
        const { minAmount, maxAmount } = await this.getMinMaxTransitTokenAmounts(
            fromTrade.blockchain,
            slippageTolerance
        );
        const minTransitTokenAmount = minAmount?.eq(0) ? new BigNumber(0) : minAmount;
        const maxTransitTokenAmount = maxAmount?.eq(0)
            ? new BigNumber(Number.MAX_VALUE)
            : maxAmount;

        const fromTransitTokenAmount = fromTrade.toToken.tokenAmount;

        if (fromTransitTokenAmount.lt(minTransitTokenAmount)) {
            const minAmount = await this.getTokenAmountForExactTransitTokenAmount(
                fromTrade,
                minTransitTokenAmount
            );
            if (!minAmount?.isFinite()) {
                throw new InsufficientLiquidityError();
            }
            throw new CrossChainMinAmountError(minAmount, fromTrade.fromToken.symbol);
        }

        if (fromTransitTokenAmount.gt(maxTransitTokenAmount)) {
            const maxAmount = await this.getTokenAmountForExactTransitTokenAmount(
                fromTrade,
                maxTransitTokenAmount
            );
            throw new CrossChainMaxAmountError(maxAmount, fromTrade.fromToken.symbol);
        }
    }

    private async getMinMaxTransitTokenAmounts(
        fromBlockchain: CelerCrossChainSupportedBlockchain,
        slippageTolerance?: number
    ): Promise<MinMaxAmounts> {
        const fromContract = this.contracts(fromBlockchain);
        const fromTransitToken = await fromContract.getTransitToken();

        const [minTransitAmountAbsolute, maxTransitAmountAbsolute] =
            await fromContract.getMinMaxTransitTokenAmounts(fromTransitToken.address);

        const getAmount = (type: 'min' | 'max'): BigNumber => {
            const fromTransitAmount = Web3Pure.fromWei(
                type === 'min' ? minTransitAmountAbsolute : maxTransitAmountAbsolute,
                fromTransitToken.decimals
            );

            if (type === 'min') {
                if (slippageTolerance) {
                    return fromTransitAmount.dividedBy(1 - slippageTolerance);
                }
            }
            return fromTransitAmount;
        };

        return {
            minAmount: getAmount('min'),
            maxAmount: getAmount('max')
        };
    }

    private async getTokenAmountForExactTransitTokenAmount(
        fromTrade: CelerCrossChainContractTrade,
        transitTokenAmount: BigNumber
    ): Promise<BigNumber> {
        const transitToken = await fromTrade.contract.getTransitToken();
        if (
            compareAddresses(fromTrade.fromToken.address, transitToken.address) ||
            transitTokenAmount.eq(0)
        ) {
            return transitTokenAmount;
        }

        return this.getTokenAmountForExactTransitTokenAmountByProvider(
            fromTrade.fromToken,
            transitToken,
            transitTokenAmount,
            fromTrade.provider
        );
    }

    private getTokenAmountForExactTransitTokenAmountByProvider(
        fromToken: Token<EvmBlockchainName>,
        transitToken: Token<EvmBlockchainName>,
        transitTokenAmount: BigNumber,
        provider: CrossChainSupportedInstantTradeProvider
    ) {
        return provider.calculateExactOutputAmount(
            new PriceToken({
                ...fromToken,
                price: new BigNumber(NaN)
            }),
            new PriceTokenAmount({
                ...transitToken,
                tokenAmount: transitTokenAmount,
                price: new BigNumber(NaN)
            }),
            {
                gasCalculation: 'disabled'
            }
        );
    }
}
