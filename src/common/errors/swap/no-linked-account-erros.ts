import { RubicSdkError } from '../rubic-sdk.error';

export class NoLinkedAccountError extends RubicSdkError {
    constructor() {
        super();
        Object.setPrototypeOf(this, NoLinkedAccountError.prototype);
    }
}
