export const multichainMethodNames = [
    'anySwapOutNative',
    'anySwapOutUnderlying',
    'Swapout'
] as const;

export type MultichainMethodName = (typeof multichainMethodNames)[number];
