import BigNumber from 'bignumber.js';
import { PriceToken, PriceTokenAmount } from 'src/common/tokens';
import {
    BLOCKCHAIN_NAME,
    BlockchainName,
    TonBlockchainName
} from 'src/core/blockchain/models/blockchain-name';

import { OnChainTradeError } from '../../../models/on-chain-trade-error';
import { RequiredOnChainCalculationOptions } from '../../common/models/on-chain-calculation-options';
import { ON_CHAIN_TRADE_TYPE } from '../../common/models/on-chain-trade-type';
import { AggregatorOnChainProvider } from '../../common/on-chain-aggregator/aggregator-on-chain-provider-abstract';
import { GasFeeInfo } from '../../common/on-chain-trade/evm-on-chain-trade/models/gas-fee-info';
import { OnChainTrade } from '../../common/on-chain-trade/on-chain-trade';
import { DEDUST_GAS } from './constants/dedust-gas';
import { DedustOnChainTrade } from './dedust-on-chain-trade';
import { DedustSwapService } from './services/dedust-swap-service';

export class DedustOnChainProvider extends AggregatorOnChainProvider {
    public tradeType = ON_CHAIN_TRADE_TYPE.DEDUST;

    private readonly dedustSwapService = new DedustSwapService();

    public isSupportedBlockchain(blockchain: BlockchainName): blockchain is TonBlockchainName {
        return blockchain === BLOCKCHAIN_NAME.TON;
    }

    public async calculate(
        from: PriceTokenAmount<TonBlockchainName>,
        toToken: PriceToken<TonBlockchainName>,
        options: RequiredOnChainCalculationOptions
    ): Promise<OnChainTrade | OnChainTradeError> {
        try {
            const { fromWithoutFee, proxyFeeInfo } = await this.handleProxyContract(from, options);
            const toStringWeiAmount = await this.dedustSwapService.calcOutputAmount(from, toToken);

            const to = new PriceTokenAmount({
                ...toToken.asStruct,
                weiAmount: new BigNumber(toStringWeiAmount)
            });

            return new DedustOnChainTrade(
                {
                    from,
                    to,
                    gasFeeInfo: await this.getGasFeeInfo(),
                    fromWithoutFee,
                    proxyFeeInfo,
                    slippageTolerance: options.slippageTolerance,
                    useProxy: false,
                    withDeflation: options.withDeflation,
                    path: this.getRoutePath(from, toToken),
                    usedForCrossChain: false
                },
                options.providerAddress
            );
        } catch (err) {
            return {
                type: this.tradeType,
                error: err
            };
        }
    }

    protected async getGasFeeInfo(): Promise<GasFeeInfo | null> {
        return {
            gasPrice: new BigNumber(1),
            gasLimit: new BigNumber(DEDUST_GAS)
        };
    }
}
