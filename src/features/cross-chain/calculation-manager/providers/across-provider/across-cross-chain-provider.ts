import { MaxAmountError, MinAmountError } from 'src/common/errors';
import { PriceToken, PriceTokenAmount } from 'src/common/tokens';
import { wrappedAddress } from 'src/common/tokens/constants/wrapped-addresses';
import { parseError } from 'src/common/utils/errors';
import { BlockchainName, EvmBlockchainName } from 'src/core/blockchain/models/blockchain-name';
import { blockchainId } from 'src/core/blockchain/utils/blockchains-info/constants/blockchain-id';
import { Web3Pure } from 'src/core/blockchain/web3-pure/web3-pure';
import { getFromWithoutFee } from 'src/features/common/utils/get-from-without-fee';

import { RequiredCrossChainOptions } from '../../models/cross-chain-options';
import { CROSS_CHAIN_TRADE_TYPE } from '../../models/cross-chain-trade-type';
import { CrossChainProvider } from '../common/cross-chain-provider';
import { CalculationResult } from '../common/models/calculation-result';
import { FeeInfo } from '../common/models/fee-info';
import { RubicStep } from '../common/models/rubicStep';
import { ProxyCrossChainEvmTrade } from '../common/proxy-cross-chain-evm-facade/proxy-cross-chain-evm-trade';
import { AcrossCrossChainTrade } from './across-cross-chain-trade';
import {
    AccrossCcrSupportedChains,
    acrossCcrSupportedChains
} from './constants/across-ccr-supported-chains';
import { AcrossAmountLimits, AcrossFeeQuoteRequestParams } from './models/across-fee-quote';
import { AcrossApiService } from './services/across-api-service';

export class AcrossCrossChainProvider extends CrossChainProvider {
    public readonly type = CROSS_CHAIN_TRADE_TYPE.ACROSS;

    public isSupportedBlockchain(blockchain: BlockchainName): boolean {
        return acrossCcrSupportedChains.some(supportedChain => supportedChain === blockchain);
    }

    public async calculate(
        from: PriceTokenAmount<EvmBlockchainName>,
        toToken: PriceToken<EvmBlockchainName>,
        options: RequiredCrossChainOptions
    ): Promise<CalculationResult> {
        const fromBlockchain = from.blockchain as AccrossCcrSupportedChains;
        const useProxy = options?.useProxy?.[this.type] ?? true;

        try {
            const feeInfo = await this.getFeeInfo(
                fromBlockchain,
                options.providerAddress,
                from,
                useProxy
            );
            const fromWithoutFee = getFromWithoutFee(
                from,
                feeInfo.rubicProxy?.platformFee?.percent
            );

            const quoteRequestParams: AcrossFeeQuoteRequestParams = {
                originChainId: blockchainId[fromBlockchain],
                destinationChainId: blockchainId[toToken.blockchain],
                inputToken: from.isNative ? wrappedAddress[from.blockchain]! : from.address,
                outputToken: toToken.isNative
                    ? wrappedAddress[toToken.blockchain]!
                    : toToken.address,
                amount: fromWithoutFee.stringWeiAmount,
                skipAmountLimit: true
            };

            const feeQuote = await AcrossApiService.getFeeQuote(quoteRequestParams);
            const toAmount = fromWithoutFee.weiAmount.minus(feeQuote.totalRelayFee.total);

            const to = new PriceTokenAmount({
                ...toToken.asStruct,
                weiAmount: toAmount
            });

            const routePath = await this.getRoutePath(from, to);

            const trade = new AcrossCrossChainTrade(
                {
                    from,
                    to,
                    toTokenAmountMin: to.tokenAmount,
                    priceImpact: from.calculatePriceImpactPercent(to),
                    gasData: await this.getGasData(from),
                    feeInfo,
                    slippage: options.slippageTolerance,
                    acrossFeeQuoteRequestParams: quoteRequestParams
                },
                options.providerAddress,
                routePath,
                useProxy
            );

            try {
                this.checkMinMaxAmounts(from, feeQuote.limits);
            } catch (err) {
                return {
                    trade,
                    tradeType: this.type,
                    error: err
                };
            }

            return {
                trade,
                tradeType: this.type
            };
        } catch (err) {
            return {
                trade: null,
                tradeType: this.type,
                error: parseError(err)
            };
        }
    }

    protected async getRoutePath(
        fromToken: PriceTokenAmount,
        toToken: PriceTokenAmount
    ): Promise<RubicStep[]> {
        return [{ type: 'cross-chain', provider: this.type, path: [fromToken, toToken] }];
    }

    protected async getFeeInfo(
        fromBlockchain: AccrossCcrSupportedChains,
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

    private checkMinMaxAmounts(from: PriceTokenAmount, limits: AcrossAmountLimits): void | never {
        if (from.weiAmount.lt(limits.minDeposit)) {
            throw new MinAmountError(
                Web3Pure.fromWei(limits.minDeposit, from.decimals),
                from.symbol
            );
        }

        if (from.weiAmount.gt(limits.maxDeposit)) {
            throw new MaxAmountError(
                Web3Pure.fromWei(limits.maxDeposit, from.decimals),
                from.symbol
            );
        }
    }
}
