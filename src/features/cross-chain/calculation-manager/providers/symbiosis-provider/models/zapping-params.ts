import { TokenAmount } from 'symbiosis-js-sdk';

export type ZappingParams = {
    tokenAmountIn: TokenAmount;
    from: string;
    to: string;
    revertableAddress: string;
    slippage: number;
    deadline: number;
};
