import BigNumber from 'bignumber.js';
import { MaxAmountError, MinAmountError } from 'src/common/errors';
import { PriceToken, PriceTokenAmount } from 'src/common/tokens';
import { parseError } from 'src/common/utils/errors';
import { BlockchainName, EvmBlockchainName } from 'src/core/blockchain/models/blockchain-name';
import { Web3Pure } from 'src/core/blockchain/web3-pure/web3-pure';
import { getFromWithoutFee } from 'src/features/common/utils/get-from-without-fee';

import { RequiredCrossChainOptions } from '../../models/cross-chain-options';
import { CROSS_CHAIN_TRADE_TYPE } from '../../models/cross-chain-trade-type';
import { CrossChainProvider } from '../common/cross-chain-provider';
import { CalculationResult } from '../common/models/calculation-result';
import { RubicStep } from '../common/models/rubicStep';
import {
    RetroBridgeSupportedBlockchain,
    retroBridgeSupportedBlockchain
} from './constants/retro-bridge-supported-blockchain';
import { RetroBridgeQuoteSendParams } from './models/retro-bridge-quote-send-params';
import { RetroBridgeTrade } from './retro-bridge-trade';
import { RetroBridgeApiService } from './services/retro-bridge-api-service';

export class RetroBridgeProvider extends CrossChainProvider {
    public readonly type = CROSS_CHAIN_TRADE_TYPE.RETRO_BRIDGE;

    public isSupportedBlockchain(blockchain: BlockchainName): boolean {
        return retroBridgeSupportedBlockchain.some(chain => chain === blockchain);
    }

    public async calculate(
        from: PriceTokenAmount<EvmBlockchainName>,
        toToken: PriceToken<EvmBlockchainName>,
        options: RequiredCrossChainOptions
    ): Promise<CalculationResult> {
        const useProxy = false;
        const fromBlockchain = from.blockchain as RetroBridgeSupportedBlockchain;
        try {
            await this.checkMinMaxAmount(from, toToken);

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
            const quoteSendParams: RetroBridgeQuoteSendParams = {
                source_chain: fromWithoutFee.blockchain,
                destination_chain: toToken.blockchain,
                asset_from: from.symbol,
                asset_to: toToken.symbol,
                amount: Web3Pure.fromWei(
                    fromWithoutFee.stringWeiAmount,
                    fromWithoutFee.decimals
                ).toFixed()
            };
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
                          quoteSendParams
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
                    quoteSendParams
                },
                options.providerAddress,
                routePath
            );

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

    private async checkMinMaxAmount(
        from: PriceTokenAmount<EvmBlockchainName>,
        toToken: PriceToken<EvmBlockchainName>
    ): Promise<void | never> {
        const tokenLimits = await RetroBridgeApiService.getTokenLimits(
            from.blockchain,
            toToken.blockchain,
            from.symbol,
            toToken.symbol
        );
        const minSendAmount = new BigNumber(Web3Pure.toWei(tokenLimits.min_send, from.decimals));
        const maxSendAmount = new BigNumber(Web3Pure.toWei(tokenLimits.max_send, from.decimals));

        if (from.weiAmount.lt(minSendAmount)) {
            throw new MinAmountError(minSendAmount, from.symbol);
        }
        if (from.weiAmount.gt(maxSendAmount)) {
            throw new MaxAmountError(maxSendAmount, from.symbol);
        }
    }
}
