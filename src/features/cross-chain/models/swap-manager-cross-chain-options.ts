import { CrossChainTradeType } from 'src/features';
import { CrossChainOptions } from '@rsdk-features/cross-chain/models/cross-chain-options';

export interface SwapManagerCrossChainCalculationOptions extends CrossChainOptions {
    readonly timeout?: number;
    readonly disabledProviders?: CrossChainTradeType[];
}
