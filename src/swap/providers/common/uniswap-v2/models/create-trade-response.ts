import { TransactionReceipt } from 'web3-eth';
import { SwapCallbacks } from '../../../../models/swap-callbacks';
import { UniswapV2Trade } from './uniswap-v2-trade';

export type CreateTradeResponse = (
    trade: UniswapV2Trade,
    options: SwapCallbacks,
    gasLimit: string,
    gasPrice?: string
) => Promise<TransactionReceipt>;
