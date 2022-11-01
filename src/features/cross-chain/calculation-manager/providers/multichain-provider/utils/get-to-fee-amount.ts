import BigNumber from 'bignumber.js';
import { MultichainTargetToken } from 'src/features/cross-chain/calculation-manager/providers/multichain-provider/models/tokens-api';

export function getToFeeAmount(
    fromAmount: BigNumber,
    targetToken: MultichainTargetToken
): BigNumber {
    return BigNumber.min(
        BigNumber.max(
            fromAmount.multipliedBy(targetToken.SwapFeeRatePerMillion / 100),
            new BigNumber(targetToken.MinimumSwapFee)
        ),
        new BigNumber(targetToken.MaximumSwapFee)
    );
}
