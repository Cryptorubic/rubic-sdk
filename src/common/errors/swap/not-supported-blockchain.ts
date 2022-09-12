import { RubicSdkError } from 'src/common/errors/rubic-sdk.error';

/**
 * @internal
 * Thrown, when provider does not support provided blockchain.
 */
export class NotSupportedBlockchain extends RubicSdkError {
    constructor() {
        super();
        Object.setPrototypeOf(this, NotSupportedBlockchain.prototype);
    }
}
