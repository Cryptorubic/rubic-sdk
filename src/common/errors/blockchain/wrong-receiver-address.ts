import { RubicSdkError } from 'src/common';

/**
 * Thrown, when passed wrong receiver address.
 */
export class WrongReceiverAddress extends RubicSdkError {
    constructor() {
        super();
        Object.setPrototypeOf(this, WrongReceiverAddress.prototype);
    }
}
