import BigNumber from 'bignumber.js';
import { PriceToken, PriceTokenAmount } from 'src/common/tokens';
import { BlockchainName, EvmBlockchainName } from 'src/core/blockchain/models/blockchain-name';
import { rangoContractAddresses } from 'src/features/common/providers/rango/constants/rango-contract-address';
import { RangoBestRouteSimulationResult } from 'src/features/common/providers/rango/models/rango-api-best-route-types';
import { RangoTransaction } from 'src/features/common/providers/rango/models/rango-api-swap-types';
import {
    RangoSupportedBlockchain,
    rangoSupportedBlockchains
} from 'src/features/common/providers/rango/models/rango-supported-blockchains';
import { RangoCommonParser } from 'src/features/common/providers/rango/services/rango-parser';

import { OnChainTradeError } from '../../../models/on-chain-trade-error';
import { RequiredOnChainCalculationOptions } from '../../common/models/on-chain-calculation-options';
import { ON_CHAIN_TRADE_TYPE } from '../../common/models/on-chain-trade-type';
import { AggregatorOnChainProvider } from '../../common/on-chain-aggregator/aggregator-on-chain-provider-abstract';
import { OnChainTrade } from '../../common/on-chain-trade/on-chain-trade';
import { RANGO_ON_CHAIN_DISABLED_PROVIDERS } from './models/rango-on-chain-disabled-providers';
import { RangoOnChainTradeStruct } from './models/rango-on-chain-trade-types';
import { RangoOnChainTrade } from './rango-on-chain-trade';
import { RangoOnChainApiService } from './services/rango-on-chain-api-service';

export class RangoOnChainProvider extends AggregatorOnChainProvider {
    public readonly tradeType = ON_CHAIN_TRADE_TYPE.RANGO;

    public isSupportedBlockchain(blockchainName: BlockchainName): boolean {
        return rangoSupportedBlockchains.some(chain => chain === blockchainName);
    }

    public async calculate(
        from: PriceTokenAmount<EvmBlockchainName>,
        toToken: PriceToken<EvmBlockchainName>,
        options: RequiredOnChainCalculationOptions
    ): Promise<OnChainTrade | OnChainTradeError> {
        try {
            const { fromWithoutFee, proxyFeeInfo } = await this.handleProxyContract(from, options);

            const path = this.getRoutePath(from, toToken);

            const swapParams = await RangoCommonParser.getSwapQueryParams(fromWithoutFee, toToken, {
                ...options,
                swapperGroups: RANGO_ON_CHAIN_DISABLED_PROVIDERS
            });

            const { route, tx } = await RangoOnChainApiService.getSwapTransaction(
                swapParams,
                false
            );
            const { outputAmountMin, outputAmount } = route as RangoBestRouteSimulationResult;
            const { txTo } = tx as RangoTransaction;

            const providerGateway =
                txTo ||
                rangoContractAddresses[from.blockchain as RangoSupportedBlockchain].providerGateway;

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
                gasFeeInfo: await this.getGasFeeInfo(),
                slippageTolerance: options.slippageTolerance,
                useProxy: options.useProxy,
                withDeflation: options.withDeflation,
                path
            };

            return new RangoOnChainTrade(tradeStruct, options.providerAddress, providerGateway!);
        } catch (err) {
            return {
                type: ON_CHAIN_TRADE_TYPE.RANGO,
                error: err
            };
        }
    }
}
