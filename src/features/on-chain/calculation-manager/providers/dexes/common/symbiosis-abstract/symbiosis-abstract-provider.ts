import { PriceToken, PriceTokenAmount } from 'src/common/tokens';

import { OnChainCalculationOptions } from '../../../common/models/on-chain-calculation-options';
import { ON_CHAIN_TRADE_TYPE, OnChainTradeType } from '../../../common/models/on-chain-trade-type';
import { OnChainTrade } from '../../../common/on-chain-trade/on-chain-trade';
import { OnChainProvider } from '../on-chain-provider/on-chain-provider';
import { SymbiosisTrade } from './symbiosis-trade';

export abstract class SymbiosisAbstractProvider extends OnChainProvider {
    public get type(): OnChainTradeType {
        return ON_CHAIN_TRADE_TYPE.SYMBIOSIS_SWAP;
    }

    public async calculate(
        from: PriceTokenAmount,
        to: PriceToken,
        options: OnChainCalculationOptions
    ): Promise<OnChainTrade> {
        return new SymbiosisTrade();
    }
}
