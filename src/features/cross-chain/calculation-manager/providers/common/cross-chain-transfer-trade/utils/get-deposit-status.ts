import { RubicSdkError } from 'src/common/errors';
import {
    CROSS_CHAIN_TRADE_TYPE,
    CrossChainTradeType
} from 'src/features/cross-chain/calculation-manager/models/cross-chain-trade-type';
import { OnChainTradeType } from 'src/features/on-chain/calculation-manager/models/on-chain-trade-type';

import { ChangellyApiService } from '../../../changelly-provider/services/changelly-api-service';
import { ChangeNowCrossChainApiService } from '../../../changenow-provider/services/changenow-cross-chain-api-service';
import { SimpleSwapApiService } from '../../../simple-swap-provider/services/simple-swap-api-service';
import {
    CROSS_CHAIN_DEPOSIT_STATUS,
    CrossChainDepositData,
    CrossChainDepositStatus
} from '../models/cross-chain-deposit-statuses';
import { Injector } from 'src/core/injector/injector';

export type getDepositStatusFn = (id: string) => Promise<CrossChainDepositData>;

const getDepositStatusFnMap: Partial<
    Record<CrossChainTradeType | OnChainTradeType, getDepositStatusFn>
> = {
    [CROSS_CHAIN_TRADE_TYPE.CHANGENOW]: ChangeNowCrossChainApiService.getTxStatus,
    [CROSS_CHAIN_TRADE_TYPE.SIMPLE_SWAP]: SimpleSwapApiService.getTxStatus,
    [CROSS_CHAIN_TRADE_TYPE.CHANGELLY]: ChangellyApiService.getTxStatus,
    [CROSS_CHAIN_TRADE_TYPE.EXOLIX]: getExolixStatus
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

async function getExolixStatus(id: string): Promise<CrossChainDepositData> {
    const { status, hashOut } = await Injector.httpClient.get<{
        status: string;
        hashOut: { hash: string };
    }>(`https://exolix.com/api/v2/transactions/${id}`);

    if (status === 'success' || status === 'refunded') {
        return {
            status: CROSS_CHAIN_DEPOSIT_STATUS.FINISHED,
            dstHash: hashOut.hash
        };
    }

    if (status === 'overdue') {
        return {
            status: CROSS_CHAIN_DEPOSIT_STATUS.FAILED,
            dstHash: null
        };
    }

    if (status === 'wait') {
        return {
            status: CROSS_CHAIN_DEPOSIT_STATUS.WAITING,
            dstHash: null
        };
    }

    return {
        status: status as CrossChainDepositStatus,
        dstHash: hashOut?.hash || null
    };
}
