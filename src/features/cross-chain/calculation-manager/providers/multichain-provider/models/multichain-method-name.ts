export const multichainMethodNames = [
    'anySwapOut',
    'anySwapOutNative',
    'anySwapOutUnderlying'
] as const;

export type MultichainMethodName = typeof multichainMethodNames[number];
