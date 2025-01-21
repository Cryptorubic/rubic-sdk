import { RubicSdkError } from 'src/common/errors';
import {
    CROSS_CHAIN_TRADE_TYPE,
    CrossChainTradeType
} from 'src/features/cross-chain/calculation-manager/models/cross-chain-trade-type';
import { OnChainTradeType } from 'src/features/on-chain/calculation-manager/models/on-chain-trade-type';

import { ChangeNowCrossChainApiService } from '../../../changenow-provider/services/changenow-cross-chain-api-service';
import { SimpleSwapApiService } from '../../../simple-swap-provider/services/simple-swap-api-service';
import { CrossChainDepositData } from '../models/cross-chain-deposit-statuses';

export type getDepositStatusFn = (id: string) => Promise<CrossChainDepositData>;

const getDepositStatusFnMap: Partial<
    Record<CrossChainTradeType | OnChainTradeType, getDepositStatusFn>
> = {
    [CROSS_CHAIN_TRADE_TYPE.CHANGENOW]: ChangeNowCrossChainApiService.getTxStatus,
    [CROSS_CHAIN_TRADE_TYPE.SIMPLE_SWAP]: SimpleSwapApiService.getTxStatus
};

export function getDepositStatus(
    id: string,
    tradeType: CrossChainTradeType | OnChainTradeType
): Promise<CrossChainDepositData> {
    const getDepositStatusFn = getDepositStatusFnMap[tradeType];

    if (!getDepositStatusFn) {
        throw new RubicSdkError('Unsupported cross chain provider');
    }

    return getDepositStatusFn(id);
}
