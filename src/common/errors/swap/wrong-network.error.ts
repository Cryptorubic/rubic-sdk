import { RubicSdkError } from 'src/common/errors/rubic-sdk.error';
import { BlockchainName } from 'src/core/blockchain/models/blockchain-name';

/**
 * Thrown during swap, if user's selected network does not match source blockchain
 * in swap parameters.
 */
export class WrongNetworkError extends RubicSdkError {
    constructor(public readonly requiredBlockchain: BlockchainName) {
        super();
        Object.setPrototypeOf(this, WrongNetworkError.prototype);
    }
}
