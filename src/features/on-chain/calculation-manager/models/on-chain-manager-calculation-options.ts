import { OnChainTradeType } from 'src/features/on-chain/calculation-manager/providers/models/on-chain-trade-type';
import { OnChainCalculationOptions } from 'src/features/on-chain/calculation-manager/providers/models/on-chain-calculation-options';

export interface OnChainManagerCalculationOptions extends OnChainCalculationOptions {
    readonly timeout?: number;
    readonly disabledProviders?: OnChainTradeType[];
}
