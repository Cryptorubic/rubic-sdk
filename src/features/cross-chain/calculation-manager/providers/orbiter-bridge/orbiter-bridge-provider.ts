import { RubicSdkError } from 'src/common/errors';
import { PriceToken, PriceTokenAmount } from 'src/common/tokens';
import { EvmBlockchainName } from 'src/core/blockchain/models/blockchain-name';
import { getFromWithoutFee } from 'src/features/common/utils/get-from-without-fee';

import { RequiredCrossChainOptions } from '../../models/cross-chain-options';
import { CROSS_CHAIN_TRADE_TYPE } from '../../models/cross-chain-trade-type';
import { CrossChainProvider } from '../common/cross-chain-provider';
import { CalculationResult } from '../common/models/calculation-result';
import { FeeInfo } from '../common/models/fee-info';
import { RubicStep } from '../common/models/rubicStep';
import { ProxyCrossChainEvmTrade } from '../common/proxy-cross-chain-evm-facade/proxy-cross-chain-evm-trade';
import { OrbiterQuoteConfig } from './models/orbiter-api-quote-types';
import {
    OrbiterSupportedBlockchain,
    orbiterSupportedBlockchains
} from './models/orbiter-supported-blockchains';
import { OrbiterBridgeTrade } from './orbiter-bridge-trade';
import { OrbiterApiService } from './services/orbiter-api-service';
import { OrbiterUtils } from './services/orbiter-utils';

export class OrbiterBridgeProvider extends CrossChainProvider {
    public readonly type = CROSS_CHAIN_TRADE_TYPE.ORBITER_BRIDGE;

    private orbiterQuoteConfigs: OrbiterQuoteConfig[] = [];

    public isSupportedBlockchain(blockchain: EvmBlockchainName): boolean {
        return orbiterSupportedBlockchains.some(
            supportedBlockchain => supportedBlockchain === blockchain
        );
    }

    public async calculate(
        from: PriceTokenAmount<EvmBlockchainName>,
        toToken: PriceToken<EvmBlockchainName>,
        options: RequiredCrossChainOptions
    ): Promise<CalculationResult> {
        const fromBlockchain = from.blockchain as OrbiterSupportedBlockchain;
        const useProxy = options?.useProxy?.[this.type] ?? true;

        try {
            this.orbiterQuoteConfigs = await OrbiterApiService.getQuoteConfigs();

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

            const quoteConfig = OrbiterUtils.getQuoteConfig({
                from,
                to: toToken,
                configs: this.orbiterQuoteConfigs
            });

            if (!OrbiterUtils.isAmountCorrect(from.tokenAmount, quoteConfig)) {
                throw new RubicSdkError(`
                    [ORBITER] Amount is out of range. 
                    Min amount - ${quoteConfig.minAmt} ${from.symbol}.
                    Max amount - ${quoteConfig.maxAmt} ${from.symbol}.
                `);
            }

            const toAmount = await OrbiterApiService.calculateAmount({
                fromAmount: fromWithoutFee.tokenAmount,
                config: quoteConfig,
                fromDecimals: from.decimals
            });

            const to = new PriceTokenAmount({
                ...toToken.asStruct,
                tokenAmount: toAmount
            });

            const gasData =
                options.gasCalculation === 'enabled'
                    ? await OrbiterBridgeTrade.getGasData({
                          feeInfo,
                          fromToken: from,
                          toToken: to,
                          receiverAddress: options.receiverAddress,
                          providerAddress: options.providerAddress,
                          quoteConfig
                      })
                    : null;

            const trade = new OrbiterBridgeTrade({
                crossChainTrade: {
                    feeInfo,
                    from,
                    gasData,
                    to,
                    priceImpact: from.calculatePriceImpactPercent(to),
                    quoteConfig
                },
                providerAddress: options.providerAddress,
                routePath: await this.getRoutePath(from, to)
            });

            return { trade, tradeType: this.type };
        } catch (err) {
            const rubicSdkError = CrossChainProvider.parseError(err);

            return {
                trade: null,
                error: rubicSdkError,
                tradeType: this.type
            };
        }
    }

    protected async getRoutePath(
        fromToken: PriceTokenAmount<EvmBlockchainName>,
        toToken: PriceTokenAmount<EvmBlockchainName>
    ): Promise<RubicStep[]> {
        return [{ type: 'cross-chain', provider: this.type, path: [fromToken, toToken] }];
    }

    protected async getFeeInfo(
        fromBlockchain: OrbiterSupportedBlockchain,
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
