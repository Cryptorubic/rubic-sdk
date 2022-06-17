import { SwapOptions } from '@features/instant-trades/models/swap-options';

export interface SwapCalculationOptions extends SwapOptions {
    /**
     * Disabled or enables gas fee calculation.
     * `rubicOptimisation` options means, that gas fee is converted into usd
     * and subtracted from output token amount, also converted in usd.
     */
    readonly gasCalculation?: 'disabled' | 'calculate' | 'rubicOptimisation';

    /**
     * If true, then only direct token pairs can be used in calculation.
     */
    readonly disableMultihops?: boolean;

    /**
     * User wallet address, from which transaction will be sent.
     */
    readonly fromAddress?: string;

    /**
     * @internal
     * Wrapped native address.
     */
    readonly wrappedAddress?: string;
}
