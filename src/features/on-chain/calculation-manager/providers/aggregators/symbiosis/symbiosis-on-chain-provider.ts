import { PriceToken, PriceTokenAmount } from 'src/common/tokens';
import { BlockchainName } from 'src/core/blockchain/models/blockchain-name';

import { RequiredOnChainCalculationOptions } from '../../common/models/on-chain-calculation-options';
import { ON_CHAIN_TRADE_TYPE, OnChainTradeType } from '../../common/models/on-chain-trade-type';
import { AggregatorOnChain } from '../../common/on-chain-aggregator/on-chain-aggregator-abstract';
import { OnChainTrade } from '../../common/on-chain-trade/on-chain-trade';

export abstract class SymbiosisOnChainProvider extends AggregatorOnChain {
    public get type(): OnChainTradeType {
        return ON_CHAIN_TRADE_TYPE.SYMBIOSIS_SWAP;
    }

    public async calculate(
        from: PriceTokenAmount<BlockchainName>,
        toToken: PriceToken<BlockchainName>,
        options: RequiredOnChainCalculationOptions
    ): Promise<OnChainTrade | OnChainTradeError> {
        return new SymbiosisTrade();
    }
}
