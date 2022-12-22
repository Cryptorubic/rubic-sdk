import BigNumber from 'bignumber.js';
import { PriceTokenAmount } from 'src/common/tokens';
import {
    ChangenowCrossChainFromSupportedBlockchain,
    ChangenowCrossChainToSupportedBlockchain
} from 'src/features/cross-chain/calculation-manager/providers/changenow-provider/models/changenow-cross-chain-supported-blockchain';
import { GasData } from 'src/features/cross-chain/calculation-manager/providers/common/emv-cross-chain-trade/models/gas-data';
import { FeeInfo } from 'src/features/cross-chain/calculation-manager/providers/common/models/fee-info';

export interface ChangenowTrade {
    from: PriceTokenAmount<ChangenowCrossChainFromSupportedBlockchain>;
    to: PriceTokenAmount<ChangenowCrossChainToSupportedBlockchain>;
    toTokenAmountMin: BigNumber;
    feeInfo: FeeInfo;
    gasData: GasData;
}
