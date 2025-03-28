import { Injector } from 'src/core/injector/injector';
import { changenowApiKey } from 'src/features/common/providers/changenow/constants/changenow-api-key';
import { ChangenowStatusResponse } from 'src/features/cross-chain/calculation-manager/providers/changenow-provider/models/changenow-api-response';

import {
    CROSS_CHAIN_DEPOSIT_STATUS,
    CrossChainDepositData
} from '../../common/cross-chain-transfer-trade/models/cross-chain-deposit-statuses';

export class ChangeNowCrossChainApiService {
    public static changenowApiEndpoint = 'https://api.changenow.io/v2';

    public static async getTxStatus(changenowId: string): Promise<CrossChainDepositData> {
        const res = await Injector.httpClient.get<ChangenowStatusResponse>(
            `${ChangeNowCrossChainApiService.changenowApiEndpoint}/exchange/by-id`,
            {
                params: { id: changenowId },
                headers: { 'x-changenow-api-key': changenowApiKey }
            }
        );

        if (res.status === 'refunded' || res.status === 'finished') {
            return {
                status: CROSS_CHAIN_DEPOSIT_STATUS.FINISHED,
                dstHash: res.payoutHash
            };
        }

        const depositData: CrossChainDepositData = {
            status: res.status,
            dstHash: res.payoutHash
        };

        return depositData;
    }
}
