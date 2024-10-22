import { RubicStep } from 'src/features/cross-chain/calculation-manager/providers/common/models/rubicStep';

export function getMultistepData(
    routingPath: RubicStep[],
    slippage: number
): { slippage: number; changedSlippage: boolean } {
    if (routingPath.length > 1 && slippage < 0.1) {
        return {
            changedSlippage: true,
            slippage: 0.1
        };
    }

    return {
        changedSlippage: false,
        slippage
    };
}
