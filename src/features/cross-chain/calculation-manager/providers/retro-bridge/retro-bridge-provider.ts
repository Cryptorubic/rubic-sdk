import BigNumber from 'bignumber.js';
import { MaxAmountError, MinAmountError, RubicSdkError } from 'src/common/errors';
import { MaxDecimalsError } from 'src/common/errors/swap/max-decimals.error';
import { PriceToken, PriceTokenAmount } from 'src/common/tokens';
import { parseError } from 'src/common/utils/errors';
import { BlockchainName, EvmBlockchainName } from 'src/core/blockchain/models/blockchain-name';
import { Web3Pure } from 'src/core/blockchain/web3-pure/web3-pure';
import { getFromWithoutFee } from 'src/features/common/utils/get-from-without-fee';

import { RequiredCrossChainOptions } from '../../models/cross-chain-options';
import { CROSS_CHAIN_TRADE_TYPE } from '../../models/cross-chain-trade-type';
import { CrossChainProvider } from '../common/cross-chain-provider';
import { CalculationResult } from '../common/models/calculation-result';
import { FeeInfo } from '../common/models/fee-info';
import { RubicStep } from '../common/models/rubicStep';
import { ProxyCrossChainEvmTrade } from '../common/proxy-cross-chain-evm-facade/proxy-cross-chain-evm-trade';
import { retroBridgeBlockchainTickers } from './constants/retro-bridge-blockchain-ticker';
import {
    RetroBridgeSupportedBlockchain,
    retroBridgeSupportedBlockchain
} from './constants/retro-bridge-supported-blockchain';
import { RetroBridgeQuoteSendParams } from './models/retro-bridge-quote-send-params';
import { RetroBridgeTrade } from './retro-bridge-trade';
import { RetroBridgeApiService } from './services/retro-bridge-api-service';

export class RetroBridgeProvider extends CrossChainProvider {
    private readonly MAX_DECIMAL = 6;

    public readonly type = CROSS_CHAIN_TRADE_TYPE.RETRO_BRIDGE;

    public isSupportedBlockchain(blockchain: BlockchainName): boolean {
        return retroBridgeSupportedBlockchain.some(chain => chain === blockchain);
    }

    public async calculate(
        from: PriceTokenAmount<EvmBlockchainName>,
        toToken: PriceToken<EvmBlockchainName>,
        options: RequiredCrossChainOptions
    ): Promise<CalculationResult> {
        const useProxy = options?.useProxy?.[this.type] ?? true;
        const fromBlockchain = from.blockchain as RetroBridgeSupportedBlockchain;
        try {
            this.checkFromAmountDecimals(from);
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
            const srcChain = this.getBlockchainTicker(
                from.blockchain as RetroBridgeSupportedBlockchain
            );

            const dstChain = this.getBlockchainTicker(
                toToken.blockchain as RetroBridgeSupportedBlockchain
            );

            const quoteSendParams: RetroBridgeQuoteSendParams = {
                source_chain: srcChain,
                destination_chain: dstChain,
                asset_from: from.symbol,
                asset_to: toToken.symbol,
                amount: Web3Pure.fromWei(
                    fromWithoutFee.stringWeiAmount,
                    fromWithoutFee.decimals
                ).toFixed()
            };

            try {
                await this.checkMinMaxAmount(from, toToken);
            } catch (err) {
                if (err instanceof MinAmountError || err instanceof MaxAmountError) {
                    return this.getEmptyTrade(
                        from,
                        toToken,
                        feeInfo,
                        quoteSendParams,
                        options.providerAddress,
                        err
                    );
                }
                throw err;
            }

            const retroBridgeQuoteConfig = await RetroBridgeApiService.getQuote(quoteSendParams);

            const to = new PriceTokenAmount({
                ...toToken.asStruct,
                tokenAmount: new BigNumber(retroBridgeQuoteConfig.amount_out)
            });
            const gasData =
                options.gasCalculation === 'enabled'
                    ? await RetroBridgeTrade.getGasData(
                          from,
                          to,
                          feeInfo,
                          options.slippageTolerance,
                          options.providerAddress,
                          quoteSendParams,
                          retroBridgeQuoteConfig.hot_wallet_address
                      )
                    : null;
            const routePath = await this.getRoutePath(from, to);
            const trade = new RetroBridgeTrade(
                {
                    from,
                    to,
                    feeInfo,
                    priceImpact: from.calculatePriceImpactPercent(to),
                    slippage: options.slippageTolerance,
                    gasData,
                    quoteSendParams,
                    hotWalletAddress: retroBridgeQuoteConfig.hot_wallet_address
                },
                options.providerAddress,
                routePath,
                useProxy
            );

            const isDecimalsGtThanMax = this.checkFromAmountDecimals(from);

            if (isDecimalsGtThanMax) {
                return {
                    trade,
                    tradeType: this.type,
                    error: new MaxDecimalsError(this.MAX_DECIMAL)
                };
            }

            return {
                trade,
                tradeType: this.type
            };
        } catch (err) {
            return {
                trade: null,
                error: parseError(err),
                tradeType: this.type
            };
        }
    }

    protected async getRoutePath(
        from: PriceTokenAmount<EvmBlockchainName>,
        toToken: PriceTokenAmount<EvmBlockchainName>
    ): Promise<RubicStep[]> {
        return [{ type: 'cross-chain', provider: this.type, path: [from, toToken] }];
    }

    protected async getFeeInfo(
        fromBlockchain: RetroBridgeSupportedBlockchain,
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

    private async checkMinMaxAmount(
        from: PriceTokenAmount<EvmBlockchainName>,
        toToken: PriceToken<EvmBlockchainName>
    ): Promise<void | never> {
        const srcChain = this.getBlockchainTicker(
            from.blockchain as RetroBridgeSupportedBlockchain
        );

        const dstChain = this.getBlockchainTicker(
            toToken.blockchain as RetroBridgeSupportedBlockchain
        );

        const tokenLimits = await RetroBridgeApiService.getTokenLimits(
            srcChain,
            dstChain,
            from.symbol,
            toToken.symbol
        );
        const minSendAmount = new BigNumber(Web3Pure.toWei(tokenLimits.min_send, from.decimals));
        const maxSendAmount = new BigNumber(Web3Pure.toWei(tokenLimits.max_send, from.decimals));

        if (from.weiAmount.lt(minSendAmount)) {
            throw new MinAmountError(new BigNumber(tokenLimits.min_send), from.symbol);
        }
        if (from.weiAmount.gt(maxSendAmount)) {
            throw new MaxAmountError(new BigNumber(tokenLimits.max_send), from.symbol);
        }
    }

    private checkFromAmountDecimals(from: PriceTokenAmount): boolean {
        if (from.decimals > this.MAX_DECIMAL) {
            const stringAmount = from.tokenAmount.toFixed();

            const amountDecimals = stringAmount.split('.')[1]?.length ?? 0;

            if (amountDecimals > this.MAX_DECIMAL) {
                return true;
            }
        }

        return false;
    }

    private getBlockchainTicker(blockchain: RetroBridgeSupportedBlockchain): string {
        const blockchainTicker = retroBridgeBlockchainTickers[blockchain];

        if (!blockchainTicker) {
            return blockchain;
        }
        return blockchainTicker;
    }

    private getEmptyTrade(
        from: PriceTokenAmount<EvmBlockchainName>,
        toToken: PriceToken<EvmBlockchainName>,
        feeInfo: FeeInfo,
        quoteSendParams: RetroBridgeQuoteSendParams,
        providerAddress: string,
        error?: RubicSdkError
    ): CalculationResult {
        const to = new PriceTokenAmount({
            ...toToken.asStruct,
            tokenAmount: new BigNumber(0)
        });

        const trade = new RetroBridgeTrade(
            {
                from,
                feeInfo,
                to,
                priceImpact: null,
                slippage: 0,
                gasData: null,
                quoteSendParams,
                hotWalletAddress: ''
            },
            providerAddress,
            [],
            false
        );

        return {
            tradeType: this.type,
            trade,
            error
        };
    }
}
