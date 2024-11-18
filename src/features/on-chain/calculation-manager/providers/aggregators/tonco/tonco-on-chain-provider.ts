import BigNumber from 'bignumber.js';
import { PriceToken, PriceTokenAmount } from 'src/common/tokens';
import {
    BLOCKCHAIN_NAME,
    BlockchainName,
    TonBlockchainName
} from 'src/core/blockchain/models/blockchain-name';
import { RubicStep } from 'src/features/cross-chain/calculation-manager/providers/common/models/rubicStep';

import { OnChainTradeError } from '../../../models/on-chain-trade-error';
import { RequiredOnChainCalculationOptions } from '../../common/models/on-chain-calculation-options';
import { ON_CHAIN_TRADE_TYPE } from '../../common/models/on-chain-trade-type';
import { AggregatorOnChainProvider } from '../../common/on-chain-aggregator/aggregator-on-chain-provider-abstract';
import { GasFeeInfo } from '../../common/on-chain-trade/evm-on-chain-trade/models/gas-fee-info';
import { OnChainTrade } from '../../common/on-chain-trade/on-chain-trade';
import { ToncoOnChainTradeStruct } from './models/tonco-trade-types';
import { ToncoSdkFacade } from './services/tonco-sdk-facade';
import { ToncoOnChainTrade } from './tonco-on-chain-trade';

export class ToncoOnChainProvider extends AggregatorOnChainProvider {
    public readonly tradeType = ON_CHAIN_TRADE_TYPE.TONCO_DEX;

    public isSupportedBlockchain(blockchain: BlockchainName): blockchain is TonBlockchainName {
        return blockchain === BLOCKCHAIN_NAME.TON;
    }

    public async calculate(
        from: PriceTokenAmount<TonBlockchainName>,
        toToken: PriceToken<TonBlockchainName>,
        options: RequiredOnChainCalculationOptions
    ): Promise<OnChainTrade | OnChainTradeError> {
        try {
            const params = await ToncoSdkFacade.fetchCommonParams(from, toToken);
            const amountOutWei = await ToncoSdkFacade.calculateAmountOut(params, from);

            const to = new PriceTokenAmount({
                ...toToken.asStruct,
                weiAmount: amountOutWei
            });

            const gasLimit = await ToncoSdkFacade.estimateGas(
                params,
                from.weiAmount,
                to.weiAmountMinusSlippage(options.slippageTolerance)
            );

            const routingPath = [
                {
                    type: 'on-chain',
                    provider: this.tradeType,
                    path: [from, to]
                }
            ] as RubicStep[];

            const tradeStruct = {
                from,
                to,
                gasFeeInfo: {
                    gasPrice: new BigNumber(1),
                    gasLimit
                },
                slippageTolerance: options.slippageTolerance,
                useProxy: false,
                withDeflation: options.withDeflation,
                usedForCrossChain: false,
                routingPath,
                isChangedSlippage: false,
                params
            } as ToncoOnChainTradeStruct;

            return new ToncoOnChainTrade(tradeStruct, options.providerAddress);
        } catch (err) {
            return {
                type: this.tradeType,
                error: err
            };
        }
    }

    protected getGasFeeInfo(): Promise<GasFeeInfo | null> {
        return Promise.resolve(null);
    }
}
