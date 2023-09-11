import BigNumber from 'bignumber.js';
import { Token } from 'src/common/tokens';

export interface UniswapRoute {
    readonly path: ReadonlyArray<Token>;
    readonly outputAbsoluteAmount: BigNumber;
    readonly routPoolInfo?: [string, string, boolean, string];
}
