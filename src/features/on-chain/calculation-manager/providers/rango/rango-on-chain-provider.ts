import BigNumber from 'bignumber.js';
import { RubicSdkError } from 'src/common/errors';
import { PriceToken, PriceTokenAmount, Token } from 'src/common/tokens';
import { BlockchainName, EvmBlockchainName } from 'src/core/blockchain/models/blockchain-name';
import { RangoBestRouteSimulationResult } from 'src/features/common/providers/rango/models/rango-api-best-route-types';
import { rangoSupportedBlockchains } from 'src/features/common/providers/rango/models/rango-supported-blockchains';
import { RangoCommonParser } from 'src/features/common/providers/rango/services/rango-parser';
import { getFromWithoutFee } from 'src/features/common/utils/get-from-without-fee';

import { OnChainTradeError } from '../../models/on-chain-trade-error';
import { RequiredOnChainCalculationOptions } from '../common/models/on-chain-calculation-options';
import { OnChainProxyFeeInfo } from '../common/models/on-chain-proxy-fee-info';
import { ON_CHAIN_TRADE_TYPE } from '../common/models/on-chain-trade-type';
import { OnChainProxyService } from '../common/on-chain-proxy-service/on-chain-proxy-service';
import { GasFeeInfo } from '../common/on-chain-trade/evm-on-chain-trade/models/gas-fee-info';
import { OnChainTrade } from '../common/on-chain-trade/on-chain-trade';
import { getGasFeeInfo } from '../common/utils/get-gas-fee-info';
import { getGasPriceInfo } from '../common/utils/get-gas-price-info';
import { RangoOnChainOptions } from './models/rango-on-chain-api-types';
import { RangoOnChainTradeStruct } from './models/rango-on-chain-trade-types';
import { RangoOnChainTrade } from './rango-on-chain-trade';
import { RangoOnChainApiService } from './services/rango-on-chain-api-service';

export class RangoOnChainProvider {
    private readonly onChainProxyService = new OnChainProxyService();

    private isSupportedBlockchain(blockchainName: BlockchainName): boolean {
        return rangoSupportedBlockchains.some(chain => chain === blockchainName);
    }

    public async calculate(
        from: PriceTokenAmount<EvmBlockchainName>,
        toToken: PriceToken<EvmBlockchainName>,
        options: RangoOnChainOptions
    ): Promise<OnChainTrade | OnChainTradeError> {
        if (!this.isSupportedBlockchain(from.blockchain)) {
            throw new RubicSdkError(`Rango doesn't support ${from.blockchain} chain!`);
        }

        try {
            const { fromWithoutFee, proxyFeeInfo } = await this.handleProxyContract(from, options);

            const path = this.getRoutePath(from, toToken);

            const bestRouteParams = await RangoCommonParser.getBestRouteQueryParams(
                fromWithoutFee,
                toToken,
                options
            );

            const { route } = await RangoOnChainApiService.getBestRoute(bestRouteParams);
            const { outputAmountMin, outputAmount } = route as RangoBestRouteSimulationResult;

            const to = new PriceTokenAmount({
                ...toToken.asStruct,
                weiAmount: new BigNumber(outputAmount)
            });

            const toTokenWeiAmountMin = new BigNumber(outputAmountMin);

            const tradeStruct: RangoOnChainTradeStruct = {
                from,
                to,
                fromWithoutFee,
                proxyFeeInfo,
                toTokenWeiAmountMin,
                gasFeeInfo: {
                    gasLimit: undefined
                },
                slippageTolerance: options.slippageTolerance,
                useProxy: options.useProxy,
                withDeflation: options.withDeflation,
                path
            };

            const gasFeeInfo =
                options.gasCalculation === 'calculate'
                    ? await this.getGasFeeInfo(tradeStruct)
                    : null;

            return new RangoOnChainTrade(
                {
                    ...tradeStruct,
                    gasFeeInfo
                },
                options.providerAddress
            );
        } catch (err) {
            return {
                type: ON_CHAIN_TRADE_TYPE.RANGO,
                error: err
            };
        }
    }

    protected async handleProxyContract(
        from: PriceTokenAmount<EvmBlockchainName>,
        fullOptions: RequiredOnChainCalculationOptions
    ): Promise<{
        fromWithoutFee: PriceTokenAmount<EvmBlockchainName>;
        proxyFeeInfo: OnChainProxyFeeInfo | undefined;
    }> {
        let fromWithoutFee: PriceTokenAmount<EvmBlockchainName>;
        let proxyFeeInfo: OnChainProxyFeeInfo | undefined;
        if (fullOptions.useProxy) {
            proxyFeeInfo = await this.onChainProxyService.getFeeInfo(
                from,
                fullOptions.providerAddress
            );
            fromWithoutFee = getFromWithoutFee(from, proxyFeeInfo.platformFee.percent);
        } else {
            fromWithoutFee = from;
        }
        return {
            fromWithoutFee,
            proxyFeeInfo
        };
    }

    private async getGasFeeInfo(tradeStruct: RangoOnChainTradeStruct): Promise<GasFeeInfo | null> {
        try {
            const gasPriceInfo = await getGasPriceInfo(tradeStruct.from.blockchain);
            const gasLimit = await RangoOnChainTrade.getGasLimit(tradeStruct);
            return getGasFeeInfo(gasLimit, gasPriceInfo);
        } catch {
            return null;
        }
    }

    private getRoutePath(
        from: Token<EvmBlockchainName>,
        to: Token<EvmBlockchainName>
    ): ReadonlyArray<Token> {
        return [from, to];
    }
}
