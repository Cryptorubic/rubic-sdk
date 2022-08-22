import { RubicSdkError } from 'src/common';

/**
 * Thrown, when `swap` transaction in lifi is failed.
 */
export class LifiPairIsUnavailable extends RubicSdkError {
    constructor() {
        super('The swap using this pair is currently unavailable. Please try again later.');
        Object.setPrototypeOf(this, LifiPairIsUnavailable.prototype);
    }
}
