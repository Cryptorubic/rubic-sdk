import BigNumber from 'bignumber.js';
import { Token } from 'src/common/tokens';

export function getStonfiGasLimit(from: Token, to: Token): BigNumber {
    if (from.isNative) return new BigNumber(0.185);
    if (to.isNative) return new BigNumber(0.17);
    return new BigNumber(0.22);
}
