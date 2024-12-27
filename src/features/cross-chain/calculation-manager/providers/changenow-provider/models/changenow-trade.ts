import BigNumber from 'bignumber.js';
import { PriceTokenAmount } from 'src/common/tokens';
import { ChangenowCrossChainSupportedBlockchain } from 'src/features/cross-chain/calculation-manager/providers/changenow-provider/constants/changenow-api-blockchain';
import { ChangenowCurrency } from 'src/features/cross-chain/calculation-manager/providers/changenow-provider/models/changenow-currencies-api';
import { GasData } from 'src/features/cross-chain/calculation-manager/providers/common/evm-cross-chain-trade/models/gas-data';
import { FeeInfo } from 'src/features/cross-chain/calculation-manager/providers/common/models/fee-info';
import { EvmOnChainTrade } from 'src/features/on-chain/calculation-manager/common/on-chain-trade/evm-on-chain-trade/evm-on-chain-trade';
import { MarkRequired } from 'ts-essentials';

import { ChangenowSwapResponse } from './changenow-swap.api';

export interface ChangenowTrade {
    from: PriceTokenAmount<ChangenowCrossChainSupportedBlockchain>;
    to: PriceTokenAmount<ChangenowCrossChainSupportedBlockchain>;
    toTokenAmountMin: BigNumber;

    fromCurrency: ChangenowCurrency;
    toCurrency: ChangenowCurrency;

    feeInfo: FeeInfo;
    gasData: GasData;

    onChainTrade: EvmOnChainTrade | null;
}

export type GetPaymentInfoReturnType = MarkRequired<
    Partial<ChangenowSwapResponse>,
    'id' | 'payinAddress'
>;
