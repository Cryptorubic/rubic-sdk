import { OnChainCalculationOptions } from 'src/features/on-chain/calculation-manager/providers/common/models/on-chain-calculation-options';
import { OnChainTradeType } from 'src/features/on-chain/calculation-manager/providers/common/models/on-chain-trade-type';

export interface OnChainManagerCalculationOptions extends OnChainCalculationOptions {
    readonly timeout?: number;
    readonly disabledProviders?: OnChainTradeType[];
}
