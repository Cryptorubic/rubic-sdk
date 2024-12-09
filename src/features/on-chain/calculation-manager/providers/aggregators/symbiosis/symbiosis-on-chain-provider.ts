import BigNumber from 'bignumber.js';
import { PriceToken, PriceTokenAmount } from 'src/common/tokens';
import { BlockchainName, EvmBlockchainName } from 'src/core/blockchain/models/blockchain-name';
import { SymbiosisApiService } from 'src/features/common/providers/symbiosis/services/symbiosis-api-service';
import { SymbiosisParser } from 'src/features/common/providers/symbiosis/services/symbiosis-parser';

import { OnChainTradeError } from '../../../models/on-chain-trade-error';
import { RequiredOnChainCalculationOptions } from '../../common/models/on-chain-calculation-options';
import { ON_CHAIN_TRADE_TYPE } from '../../common/models/on-chain-trade-type';
import { AggregatorOnChainProvider } from '../../common/on-chain-aggregator/aggregator-on-chain-provider-abstract';
import { OnChainTrade } from '../../common/on-chain-trade/on-chain-trade';
import { symbiosisOnChainSupportedBlockchains } from './models/symbiosis-on-chain-supported-blockchains';
import { SymbiosisTradeStruct } from './models/symbiosis-on-chain-trade-types';
import { SymbiosisOnChainTrade } from './symbiosis-on-chain-trade';

export class SymbiosisOnChainProvider extends AggregatorOnChainProvider {
    public readonly tradeType = ON_CHAIN_TRADE_TYPE.SYMBIOSIS_SWAP;

    public isSupportedBlockchain(blockchain: BlockchainName): boolean {
        return symbiosisOnChainSupportedBlockchains.some(chain => chain === blockchain);
    }

    public async calculate(
        from: PriceTokenAmount<BlockchainName>,
        toToken: PriceToken<BlockchainName>,
        options: RequiredOnChainCalculationOptions
    ): Promise<OnChainTrade | OnChainTradeError> {
        try {
            const { fromWithoutFee, proxyFeeInfo } = await this.handleProxyContract(from, options);
            const path = this.getRoutePath(from, toToken);

            const swapBody = await SymbiosisParser.getSwapRequestBody(fromWithoutFee, toToken, {
                slippage: options.slippageTolerance
            });
            const {
                approveTo: providerGateway,
                tokenAmountOut: { amount: toTokenAmount }
            } = await SymbiosisApiService.getOnChainSwapTx(swapBody);

            const to = new PriceTokenAmount({
                ...toToken.asStruct,
                weiAmount: new BigNumber(toTokenAmount)
            });

            const tradeStruct: SymbiosisTradeStruct = {
                from: from as PriceTokenAmount<EvmBlockchainName>,
                to: to as PriceTokenAmount<EvmBlockchainName>,
                fromWithoutFee: fromWithoutFee as PriceTokenAmount<EvmBlockchainName>,
                proxyFeeInfo,
                gasFeeInfo: {
                    gasLimit: undefined
                },
                slippageTolerance: options.slippageTolerance,
                useProxy: options.useProxy,
                withDeflation: options.withDeflation,
                path
            };

            return new SymbiosisOnChainTrade(
                {
                    ...tradeStruct,
                    gasFeeInfo: await this.getGasFeeInfo()
                },
                options.providerAddress,
                providerGateway
            );
        } catch (err) {
            return {
                type: ON_CHAIN_TRADE_TYPE.SYMBIOSIS_SWAP,
                error: err
            };
        }
    }
}
