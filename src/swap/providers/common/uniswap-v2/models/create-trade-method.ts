import { TransactionReceipt } from 'web3-eth';
import { InternalUniswapV2Trade } from './uniswap-v2-trade';
import { SwapTransactionOptionsWithGasLimit } from '../../../../models/swap-transaction-options';

export type CreateTradeMethod = (
    trade: InternalUniswapV2Trade,
    options: SwapTransactionOptionsWithGasLimit
) => Promise<TransactionReceipt>;
