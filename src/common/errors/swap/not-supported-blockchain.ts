import { RubicSdkError } from '@rsdk-common/errors/rubic-sdk.error';

export class NotSupportedBlockchain extends RubicSdkError {
    constructor() {
        super();
        Object.setPrototypeOf(this, NotSupportedBlockchain.prototype);
    }
}
