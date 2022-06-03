import { CrossChainTradeType } from 'src/features';
import { RequiredCrossChainOptions } from '@features/cross-chain/models/cross-chain-options';
import { PriceTokenAmount } from '@core/blockchain/tokens/price-token-amount';
import { PriceToken } from '@core/blockchain/tokens/price-token';
import { CrossChainTrade } from '@features/cross-chain/providers/common/cross-chain-trade';

export abstract class CrossChainTradeProvider {
    public abstract type: CrossChainTradeType;

    public abstract calculate(
        from: PriceTokenAmount,
        to: PriceToken,
        options: RequiredCrossChainOptions
    ): Promise<CrossChainTrade>;
}
