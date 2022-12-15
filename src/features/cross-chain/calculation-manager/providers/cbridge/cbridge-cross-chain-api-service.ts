import { Injector } from 'src/core/injector/injector';
import { CbridgeEstimateAmountRequest } from 'src/features/cross-chain/calculation-manager/providers/cbridge/models/cbridge-estimate-amount-request';
import { CbridgeEstimateAmountResponse } from 'src/features/cross-chain/calculation-manager/providers/cbridge/models/cbridge-estimate-amount-response';
import { CbridgeTransferConfigsResponse } from 'src/features/cross-chain/calculation-manager/providers/cbridge/models/cbridge-transfer-configs-response';

export class CbridgeCrossChainApiService {
    private readonly httpClient = Injector.httpClient;

    public static readonly apiEndpoint = 'https://cbridge-prod2.celer.app/v2/';

    constructor() {}

    public async getTransferConfigs(): Promise<CbridgeTransferConfigsResponse> {
        return this.httpClient.get(`${CbridgeCrossChainApiService.apiEndpoint}getTransferConfigs`);
    }

    public async fetchEstimateAmount(
        requestParams: CbridgeEstimateAmountRequest
    ): Promise<CbridgeEstimateAmountResponse> {
        return this.httpClient.get<CbridgeEstimateAmountResponse>(
            `${CbridgeCrossChainApiService.apiEndpoint}estimateAmt`,
            { params: { ...requestParams } }
        );
    }
}
