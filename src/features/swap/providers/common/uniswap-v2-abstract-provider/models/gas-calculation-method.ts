import BigNumber from 'bignumber.js';
import { BatchCall } from '@core/blockchain/web3-public/models/batch-call';
import { InternalUniswapV2Trade } from '@features/swap/providers/common/uniswap-v2-abstract-provider/models/uniswap-v2-trade';

export type GasCalculationMethod = (trade: InternalUniswapV2Trade) => {
    callData: BatchCall;
    defaultGasLimit: BigNumber;
};
