export interface InternalUniswapV2Trade {
    amountIn: string;
    amountOut: string;
    path: string[];
    to: string;
    deadline: number;
    exact: 'input' | 'output';
}
