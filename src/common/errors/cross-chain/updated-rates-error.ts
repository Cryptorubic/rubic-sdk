import { RubicSdkError } from 'src/common/errors';
import { EvmCrossChainTrade } from 'src/features/cross-chain/calculation-manager/providers/common/emv-cross-chain-trade/evm-cross-chain-trade';

/**
 * Thrown, when current gas price is higher, than max gas price on cross-chain contract
 * in target network.
 */
export class UpdatedRatesError extends RubicSdkError {
    constructor(public readonly trade: EvmCrossChainTrade) {
        super();
        Object.setPrototypeOf(this, UpdatedRatesError.prototype);
    }
}
