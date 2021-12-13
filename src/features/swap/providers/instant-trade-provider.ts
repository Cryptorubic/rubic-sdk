import { BLOCKCHAIN_NAME } from '@core/blockchain/models/BLOCKCHAIN_NAME';
import { PriceToken } from '@core/blockchain/tokens/price-token';
import { PriceTokenAmount } from '@core/blockchain/tokens/price-token-amount';
import { InstantTrade } from '@features/swap/trades/instant-trade';

export abstract class InstantTradeProvider {
    public abstract readonly blockchain: BLOCKCHAIN_NAME;

    public abstract calculate(from: PriceTokenAmount, to: PriceToken): Promise<InstantTrade>;
}
