import BigNumber from 'bignumber.js';
import { Token } from 'src/common';

export interface UniswapRoute {
    readonly path: ReadonlyArray<Token>;
    readonly outputAbsoluteAmount: BigNumber;
}
