export type DefaultRoutesMethodArguments = [string, string[]][];

export type AerodromeRoutesMethodArgument = [string, [[string, string, boolean, string]]];

export type AerodromeRoutesMethodArguments = AerodromeRoutesMethodArgument[];

export type ExtendedRoutesMethodArguments =
    | DefaultRoutesMethodArguments
    | AerodromeRoutesMethodArguments;
