import BigNumber from 'bignumber.js';
import { Token } from 'src/common/tokens';
import { AerodromeRoutePoolArgument } from 'src/features/on-chain/calculation-manager/providers/dexes/common/uniswap-v2-abstract/models/aerodrome-route-method-arguments';

export interface UniswapRoute {
    readonly path: ReadonlyArray<Token>;
    readonly outputAbsoluteAmount: BigNumber;
    readonly routPoolInfo?: AerodromeRoutePoolArgument[];
}
