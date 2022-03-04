import { RubicSdkError } from 'src/common';

export class TimeoutError extends RubicSdkError {
    constructor(message?: string) {
        super(message);
        this.name = 'TimeoutError';

        Object.setPrototypeOf(this, TimeoutError.prototype);
    }
}
