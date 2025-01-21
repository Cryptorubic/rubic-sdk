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
import { CalculationResult } from '../common/models/calculation-result';
import { FeeInfo } from '../common/models/fee-info';
import { RubicStep } from '../common/models/rubicStep';
import { ProxyCrossChainEvmTrade } from '../common/proxy-cross-chain-evm-facade/proxy-cross-chain-evm-trade';
import { ChangellyCcrTrade } from './changelly-ccr-trade';
import { changellySpecificChainTickers } from './constants/changelly-specific-chain-ticker';
import { changellySupportedChains } from './constants/changelly-supported-chains';
import { changellyNativeTokensData } from './constants/native-token-data';
import { ChangellyToken } from './models/changelly-token';
import { ChangellyApiService } from './services/changelly-api-service';

export class ChangellyCcrProvider extends CrossChainProvider {
    public readonly type = CROSS_CHAIN_TRADE_TYPE.CHANGELLY;

    public isSupportedBlockchain(fromBlockchain: BlockchainName): boolean {
        return changellySupportedChains.some(chain => chain === fromBlockchain);
    }

    public async calculate(
        from: PriceTokenAmount,
        toToken: PriceToken,
        options: RequiredCrossChainOptions
    ): Promise<CalculationResult<EvmEncodeConfig>> {
        const useProxy = options?.useProxy?.[this.type] || false;

        try {
            const feeInfo = await this.getFeeInfo(
                from.blockchain as EvmBlockchainName,
                options.providerAddress,
                from,
                useProxy
            );

            const fromWithoutFee = getFromWithoutFee(
                from,
                feeInfo.rubicProxy?.platformFee?.percent
            );

            const changellyTokens = await this.getFromToChangellyTokens(from, toToken);

            const response = await ChangellyApiService.getFixedRateEstimation({
                from: changellyTokens.fromToken.ticker,
                to: changellyTokens.toToken.ticker,
                amountFrom: fromWithoutFee.tokenAmount.toFixed()
            });

            if (!response.result && response.error) {
                if (response.error.message.includes('Invalid amount for')) {
                    const tokenLimits = response.error.data.limits;
                    const minMaxError = this.checkMinMaxErrors(
                        from,
                        tokenLimits.min.from,
                        tokenLimits.max.from
                    );

                    if (minMaxError) {
                        return {
                            tradeType: this.type,
                            trade: this.getEmptyTrade(
                                from,
                                toToken,
                                feeInfo,
                                options.providerAddress,
                                changellyTokens
                            ),
                            error: minMaxError
                        };
                    }
                }

                throw new Error(response.error.message);
            }

            const quote = response.result[0]!;

            const toAmount = new BigNumber(quote.amountTo);

            const toAmountMin = toAmount;

            const to = new PriceTokenAmount({
                ...toToken.asStruct,
                tokenAmount: toAmount
            });

            const routePath = await this.getRoutePath(from, to);

            const trade = new ChangellyCcrTrade({
                from,
                to,
                changellyTokens,
                feeInfo,
                gasData: null,
                priceImpact: from.calculatePriceImpactPercent(to),
                providerAddress: options.providerAddress,
                useProxy,
                toTokenAmountMin: toAmountMin,
                routePath,
                onChainTrade: null
            });

            return {
                trade,
                tradeType: this.type
            };
        } catch (err) {
            return {
                tradeType: this.type,
                trade: null,
                error: err
            };
        }
    }

    private checkMinMaxErrors(
        fromToken: PriceTokenAmount,
        minFrom: string,
        maxFrom: string
    ): MinAmountError | MaxAmountError | null {
        if (fromToken.tokenAmount.lt(minFrom)) {
            return new MinAmountError(new BigNumber(minFrom), fromToken.symbol);
        }
        if (fromToken.tokenAmount.gt(maxFrom)) {
            return new MaxAmountError(new BigNumber(maxFrom), fromToken.symbol);
        }

        return null;
    }

    private async getFromToChangellyTokens(
        from: PriceTokenAmount,
        to: PriceToken
    ): Promise<{ fromToken: ChangellyToken; toToken: ChangellyToken }> {
        const { result: tokenList } = await ChangellyApiService.fetchTokenList();

        return {
            fromToken: this.getChangellyToken(tokenList, from),
            toToken: this.getChangellyToken(tokenList, to)
        };
    }

    private getChangellyToken(tokenList: ChangellyToken[], token: PriceToken): ChangellyToken {
        const tokenBlockchain = this.getBlockchain(token.blockchain);

        const changellytoken = tokenList.find(
            fetchedToken =>
                fetchedToken.blockchain.toLowerCase() === tokenBlockchain &&
                ((fetchedToken.contractAddress &&
                    compareAddresses(fetchedToken.contractAddress, token.address)) ||
                    (!fetchedToken.contractAddress && token.isNative) ||
                    this.isNativeTokenWithAddress(fetchedToken))
        );

        if (!changellytoken) {
            throw new NotSupportedTokensError();
        }

        return changellytoken;
    }

    private getBlockchain(blockchain: BlockchainName): string {
        const specificChainTicker = changellySpecificChainTickers[blockchain];

        return specificChainTicker ? specificChainTicker : blockchain.toLowerCase();
    }

    private isNativeTokenWithAddress(currency: ChangellyToken): boolean {
        return changellyNativeTokensData.some(
            nativeTokenData =>
                nativeTokenData.ticker === currency.ticker &&
                nativeTokenData.blockchain === currency.blockchain.toLowerCase() &&
                nativeTokenData.address === currency.contractAddress
        );
    }

    protected async getRoutePath(
        from: PriceTokenAmount,
        to: PriceTokenAmount
    ): Promise<RubicStep[]> {
        return [
            {
                type: 'cross-chain',
                provider: CROSS_CHAIN_TRADE_TYPE.CHANGELLY,
                path: [from, to]
            }
        ];
    }

    private getEmptyTrade(
        from: PriceTokenAmount,
        toToken: PriceToken,
        feeInfo: FeeInfo,
        providerAddress: string,
        changellyTokens: { fromToken: ChangellyToken; toToken: ChangellyToken }
    ): ChangellyCcrTrade {
        const to = new PriceTokenAmount({
            ...toToken.asStruct,
            tokenAmount: new BigNumber(0)
        });
        const trade = new ChangellyCcrTrade({
            from,
            to,
            toTokenAmountMin: new BigNumber(0),
            priceImpact: 0,
            feeInfo,
            changellyTokens,
            // rateId: '',
            routePath: [],
            useProxy: false,
            providerAddress,
            gasData: null,
            onChainTrade: null
        });

        return trade;
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
}
