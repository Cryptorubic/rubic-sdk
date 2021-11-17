import BigNumber from 'bignumber.js';
import { BatchCall } from 'src/core/blockchain/web3-public/models/batch-call';
import { InternalUniswapV2Trade } from 'src/features/swap/providers/common/uniswap-v2/models/uniswap-v2-trade';

export type GasCalculationMethod = (trade: InternalUniswapV2Trade) => {
    callData: BatchCall;
    defaultGasLimit: BigNumber;
};
