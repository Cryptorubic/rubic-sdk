export const multichainMethodNames = [
    'anySwapOut',
    'anySwapOutNative',
    'anySwapOutUnderlying',
    'Swapout'
] as const;

export type MultichainMethodName = typeof multichainMethodNames[number];
