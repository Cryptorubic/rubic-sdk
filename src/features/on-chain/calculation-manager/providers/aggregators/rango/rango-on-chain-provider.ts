import BigNumber from 'bignumber.js';
import { RubicSdkError } from 'src/common/errors';
import { PriceToken, PriceTokenAmount } from 'src/common/tokens';
import { BlockchainName, EvmBlockchainName } from 'src/core/blockchain/models/blockchain-name';
import { RangoBestRouteSimulationResult } from 'src/features/common/providers/rango/models/rango-api-best-route-types';
import { RangoTransaction } from 'src/features/common/providers/rango/models/rango-api-swap-types';
import { rangoSupportedBlockchains } from 'src/features/common/providers/rango/models/rango-supported-blockchains';
import { RangoCommonParser } from 'src/features/common/providers/rango/services/rango-parser';

import { OnChainTradeError } from '../../../models/on-chain-trade-error';
import { RequiredOnChainCalculationOptions } from '../../common/models/on-chain-calculation-options';
import { ON_CHAIN_TRADE_TYPE } from '../../common/models/on-chain-trade-type';
import { AggregatorOnChain } from '../../common/on-chain-aggregator/on-chain-aggregator-abstract';
import { GasFeeInfo } from '../../common/on-chain-trade/evm-on-chain-trade/models/gas-fee-info';
import { OnChainTrade } from '../../common/on-chain-trade/on-chain-trade';
import { getGasFeeInfo } from '../../common/utils/get-gas-fee-info';
import { getGasPriceInfo } from '../../common/utils/get-gas-price-info';
import { rangoOnChainDisabledProviders } from './models/rango-on-chain-disabled-providers';
import { RangoOnChainTradeStruct } from './models/rango-on-chain-trade-types';
import { RangoOnChainTrade } from './rango-on-chain-trade';
import { RangoOnChainApiService } from './services/rango-on-chain-api-service';

export class RangoOnChainProvider extends AggregatorOnChain {
    protected isSupportedBlockchain(blockchainName: BlockchainName): boolean {
        return rangoSupportedBlockchains.some(chain => chain === blockchainName);
    }

    public async calculate(
        from: PriceTokenAmount<EvmBlockchainName>,
        toToken: PriceToken<EvmBlockchainName>,
        options: RequiredOnChainCalculationOptions
    ): Promise<OnChainTrade | OnChainTradeError> {
        if (!this.isSupportedBlockchain(from.blockchain)) {
            throw new RubicSdkError(`Rango doesn't support ${from.blockchain} chain!`);
        }

        try {
            const { fromWithoutFee, proxyFeeInfo } = await this.handleProxyContract(from, options);

            const path = this.getRoutePath(from, toToken);

            const swapParams = await RangoCommonParser.getSwapQueryParams(fromWithoutFee, toToken, {
                ...options,
                swapperGroups: rangoOnChainDisabledProviders
            });

            const { route, tx } = await RangoOnChainApiService.getSwapTransaction(swapParams);
            const { outputAmountMin, outputAmount } = route as RangoBestRouteSimulationResult;
            const { approveTo: providerGateway } = tx as RangoTransaction;

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
                    ? await this.getGasFeeInfo(tradeStruct, providerGateway!)
                    : null;

            return new RangoOnChainTrade(
                {
                    ...tradeStruct,
                    gasFeeInfo
                },
                options.providerAddress,
                providerGateway!
            );
        } catch (err) {
            return {
                type: ON_CHAIN_TRADE_TYPE.RANGO,
                error: err
            };
        }
    }

    protected async getGasFeeInfo(
        tradeStruct: RangoOnChainTradeStruct,
        providerGateway: string
    ): Promise<GasFeeInfo | null> {
        try {
            const gasPriceInfo = await getGasPriceInfo(tradeStruct.from.blockchain);
            const gasLimit = await RangoOnChainTrade.getGasLimit(tradeStruct, providerGateway);
            return getGasFeeInfo(gasLimit, gasPriceInfo);
        } catch {
            return null;
        }
    }
}
