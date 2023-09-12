export type DefaultRoutesMethodArguments = [string, string[]][];

export type AerodromeRoutePoolArgument = [string, string, boolean, string];

export type AerodromeRoutesMethodArgument = [string, AerodromeRoutePoolArgument[]];

export type AerodromeRoutesMethodArguments = AerodromeRoutesMethodArgument[];

export type ExtendedRoutesMethodArguments =
    | DefaultRoutesMethodArguments
    | AerodromeRoutesMethodArguments;
