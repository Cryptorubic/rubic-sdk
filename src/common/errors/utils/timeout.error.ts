import { RubicSdkError } from 'src/common';

export class TimeoutError extends Error {
    constructor(message?: string) {
        super(message);
        this.name = 'TimeoutError';

        Object.setPrototypeOf(this, RubicSdkError.prototype);
    }
}
