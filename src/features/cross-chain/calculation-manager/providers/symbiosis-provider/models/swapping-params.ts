import { TokenAmount } from 'symbiosis-js-sdk';
import { Token } from 'symbiosis-js-sdk/dist';

export type SwappingParams = {
    tokenAmountIn: TokenAmount;
    tokenOut: Token;
    from: string;
    to: string;
    revertableAddress: string;
    slippage: number;
    deadline: number;
};
