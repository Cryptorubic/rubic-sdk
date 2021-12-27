import { SwapOptions } from './swap-options';
export interface SwapCalculationOptions extends SwapOptions {
    readonly gasCalculation?: 'disabled' | 'calculate' | 'rubicOptimisation';
    readonly disableMultihops?: boolean;
}
