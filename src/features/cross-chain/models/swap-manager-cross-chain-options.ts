import { CrossChainOptions } from 'src/features/cross-chain/models/cross-chain-options';
import { CrossChainTradeType } from 'src/features/cross-chain/models/cross-chain-trade-type';

export interface SwapManagerCrossChainCalculationOptions extends CrossChainOptions {
    /**
     * An array of disabled cross chain providers.
     */
    readonly disabledProviders?: CrossChainTradeType[];
}
