import { CROSS_CHAIN_TRADE_TYPE, TRADE_TYPE, TradeType } from 'src/features';
import { BlockchainName, BlockchainsInfo, Web3Pure } from 'src/core';
import { PriceToken } from '@core/blockchain/tokens/price-token';
import { PriceTokenAmount } from '@core/blockchain/tokens/price-token-amount';
import {
    CelerCrossChainSupportedBlockchain,
    celerCrossChainSupportedBlockchains
} from '@features/cross-chain/providers/celer-trade-provider/constants/celer-cross-chain-supported-blockchain';
import { getCelerCrossChainContract } from '@features/cross-chain/providers/celer-trade-provider/constants/celer-cross-chain-contracts';
import { RequiredCrossChainOptions } from '@features/cross-chain/models/cross-chain-options';
import { CelerCrossChainTrade } from '@features/cross-chain/providers/celer-trade-provider/celer-cross-chain-trade';
import BigNumber from 'bignumber.js';
import { compareAddresses, notNull, RubicSdkError } from 'src/common';
import { EstimateAmtResponse } from '@features/cross-chain/providers/celer-trade-provider/models/estimate-amount-response';
import { Injector } from '@core/sdk/injector';
import { CelerCrossChainContractTrade } from '@features/cross-chain/providers/celer-trade-provider/celer-cross-chain-contract-trade/celer-cross-chain-contract-trade';
import { ItCalculatedTrade } from '@features/cross-chain/providers/common/celer-rubic/models/it-calculated-trade';
import { CelerItCrossChainContractTrade } from '@features/cross-chain/providers/celer-trade-provider/celer-cross-chain-contract-trade/celer-it-cross-chain-contract-trade/celer-it-cross-chain-contract-trade';
import { CelerDirectCrossChainContractTrade } from '@features/cross-chain/providers/celer-trade-provider/celer-cross-chain-contract-trade/celer-direct-cross-chain-trade/celer-direct-cross-chain-contract-trade';
import { CrossChainContractData } from '@features/cross-chain/providers/common/celer-rubic/cross-chain-contract-data';
import { wrappedNative } from '@features/cross-chain/providers/celer-trade-provider/constants/wrapped-native';
import { CelerRubicCrossChainTradeProvider } from '@features/cross-chain/providers/common/celer-rubic/celer-rubic-cross-chain-trade-provider';
import { WrappedCrossChainTrade } from '@features/cross-chain/providers/common/models/wrapped-cross-chain-trade';

export class CelerCrossChainTradeProvider extends CelerRubicCrossChainTradeProvider {
    public static isSupportedBlockchain(
        blockchain: BlockchainName
    ): blockchain is CelerCrossChainSupportedBlockchain {
        return celerCrossChainSupportedBlockchains.some(
            supportedBlockchain => supportedBlockchain === blockchain
        );
    }

    public readonly type = CROSS_CHAIN_TRADE_TYPE.CELER;

    protected contracts = getCelerCrossChainContract;

    public async calculate(
        from: PriceTokenAmount,
        to: PriceToken,
        options: RequiredCrossChainOptions
    ): Promise<Omit<WrappedCrossChainTrade, 'tradeType'> | null> {
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
                ...(await this.contracts(fromBlockchain).getTransitToken(from)),
                price: new BigNumber(1)
            }),
            new PriceToken({
                ...(await this.contracts(toBlockchain).getTransitToken(to)),
                price: new BigNumber(1)
            })
        ]);

        const { gasCalculation, providerAddress, ...slippages } = options;

        try {
            await this.checkContractsState(
                this.contracts(fromBlockchain),
                this.contracts(toBlockchain)
            );

            const fromTrade = await this.calculateBestTrade(
                fromBlockchain,
                from,
                fromTransitToken,
                slippages.fromSlippageTolerance
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
                throw new RubicSdkError(
                    'Increase `toSlippageTolerance` field to calculate Celer cross chain trade'
                );
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
                await this.checkMinMaxAmountsErrors(fromTrade);
            }

            const { toTransitTokenAmount, transitFeeToken } = await this.getToTransitTokenAmount(
                toBlockchain,
                fromTrade.fromToken,
                estimateTransitAmountWithSlippage,
                fromTrade.contract
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
                [
                    TRADE_TYPE.ONE_INCH_ARBITRUM,
                    TRADE_TYPE.ONE_INCH_BSC,
                    TRADE_TYPE.ONE_INCH_ETHEREUM,
                    TRADE_TYPE.ONE_INCH_POLYGON,
                    TRADE_TYPE.ONE_INCH_AVALANCHE,
                    TRADE_TYPE.ONE_INCH_ARBITRUM
                ]
            );

            let cryptoFeeToken = await fromTrade.contract.getCryptoFeeToken(toTrade.contract);
            const nativeTokenPrice = (
                await this.getBestItContractTrade(
                    fromBlockchain,
                    cryptoFeeToken,
                    fromTransitToken,
                    fromSlippageTolerance
                )
            ).toToken.tokenAmount;
            cryptoFeeToken = new PriceTokenAmount({
                ...cryptoFeeToken.asStructWithAmount,
                price: nativeTokenPrice
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
                    gasData
                },
                providerAddress,
                Number.parseInt((celerSlippage * 10 ** 6 * 100).toFixed())
            );

            try {
                await this.checkMinMaxAmountsErrors(fromTrade);
            } catch (err: unknown) {
                return {
                    trade,
                    error: this.parseError(err)
                };
            }

            return {
                trade
            };
        } catch (err: unknown) {
            return {
                trade: null,
                error: this.parseError(err)
            };
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

        return Web3Pure.fromWei(estimate.estimated_receive_amt, toTransitToken.decimals);
    }

    private async fetchCelerEstimate(
        fromBlockchain: CelerCrossChainSupportedBlockchain,
        toBlockchain: CelerCrossChainSupportedBlockchain,
        amount: BigNumber,
        transitToken: PriceToken,
        slippageTolerance: number
    ): Promise<EstimateAmtResponse> {
        const sourceChainId = BlockchainsInfo.getBlockchainByName(fromBlockchain).id;
        const destinationChainId = BlockchainsInfo.getBlockchainByName(toBlockchain).id;
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

    protected async calculateBestTrade(
        blockchain: CelerCrossChainSupportedBlockchain,
        from: PriceTokenAmount,
        toToken: PriceToken,
        slippageTolerance: number,
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
            disabledProviders
        );
    }

    protected async getItCalculatedTrade(
        contract: CrossChainContractData,
        providerIndex: number,
        from: PriceTokenAmount,
        toToken: PriceToken,
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

    protected async getBestItContractTrade(
        blockchain: CelerCrossChainSupportedBlockchain,
        from: PriceTokenAmount,
        toToken: PriceToken,
        slippageTolerance: number,
        disabledProviders?: TradeType[]
    ): Promise<CelerItCrossChainContractTrade> {
        const contract = this.contracts(blockchain);
        const promises: Promise<ItCalculatedTrade>[] = contract.providersData
            .filter(data => !disabledProviders?.some(provider => provider === data.provider.type))
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
}
