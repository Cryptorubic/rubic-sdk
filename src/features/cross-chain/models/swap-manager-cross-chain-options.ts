import { CrossChainTradeType } from 'src/features';
import { CrossChainOptions } from '@rsdk-features/cross-chain/models/cross-chain-options';

export interface SwapManagerCrossChainCalculationOptions extends CrossChainOptions {
    /**
     * An array of disabled cross chain providers.
     */
    readonly disabledProviders?: CrossChainTradeType[];
}
