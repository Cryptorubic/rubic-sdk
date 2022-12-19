import { Injector } from 'src/core/injector/injector';
import { CbridgeEstimateAmountRequest } from 'src/features/cross-chain/calculation-manager/providers/cbridge/models/cbridge-estimate-amount-request';
import { CbridgeEstimateAmountResponse } from 'src/features/cross-chain/calculation-manager/providers/cbridge/models/cbridge-estimate-amount-response';
import { CbridgeStatusResponse } from 'src/features/cross-chain/calculation-manager/providers/cbridge/models/cbridge-status-response';
import { CbridgeTransferConfigsResponse } from 'src/features/cross-chain/calculation-manager/providers/cbridge/models/cbridge-transfer-configs-response';

export class CbridgeCrossChainApiService {
    public static readonly apiEndpoint = 'https://cbridge-prod2.celer.app/v2/';

    constructor() {}

    public static async getTransferConfigs(): Promise<CbridgeTransferConfigsResponse> {
        return Injector.httpClient.get(
            `${CbridgeCrossChainApiService.apiEndpoint}getTransferConfigs`
        );
    }

    public static async fetchEstimateAmount(
        requestParams: CbridgeEstimateAmountRequest
    ): Promise<CbridgeEstimateAmountResponse> {
        return Injector.httpClient.get<CbridgeEstimateAmountResponse>(
            `${CbridgeCrossChainApiService.apiEndpoint}estimateAmt`,
            { params: { ...requestParams } }
        );
    }

    public static async fetchTradeStatus(transferId: string): Promise<CbridgeStatusResponse> {
        return Injector.httpClient.post<CbridgeStatusResponse>(
            `${CbridgeCrossChainApiService.apiEndpoint}getTransferStatus`,
            { transfer_id: transferId }
        );
    }
}
