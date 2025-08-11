import { RubicSdkError } from 'src/common/errors/rubic-sdk.error';
import { SwapErrorResponseInterface } from 'src/features/ws-api/models/swap-error-response-interface';

export class SimulationFailedError extends RubicSdkError {
    constructor(public readonly apiError: SwapErrorResponseInterface) {
        super('Transaction simulation failed!');
        Reflect.setPrototypeOf(this, SimulationFailedError.prototype);
    }
}
