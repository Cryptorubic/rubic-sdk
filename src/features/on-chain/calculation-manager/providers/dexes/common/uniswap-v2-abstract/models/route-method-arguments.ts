import { AerodromeRoutesMethodArgument } from 'src/features/on-chain/calculation-manager/providers/dexes/common/uniswap-v2-abstract/models/aerodrome-route-method-arguments';

export type DefaultRoutesMethodArgument = [string, string[]];

export type ExtendedRoutesMethodArguments =
    | DefaultRoutesMethodArgument[]
    | AerodromeRoutesMethodArgument[];
