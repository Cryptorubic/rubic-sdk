import { SwapOptions } from '@rsdk-features/instant-trades/models/swap-options';
import { MarkRequired } from 'ts-essentials';

/**
 * Stores options for calculating trade.
 */
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
     * Affiliate address for zrx provider.
     */
    readonly zrxAffiliateAddress?: string;

    /**
     * @internal
     * Wrapped native address.
     */
    readonly wrappedAddress?: string;
}

export type RequiredSwapCalculationOptions = MarkRequired<
    SwapCalculationOptions,
    'slippageTolerance' | 'deadlineMinutes' | 'gasCalculation' | 'disableMultihops' | 'fromAddress'
>;
