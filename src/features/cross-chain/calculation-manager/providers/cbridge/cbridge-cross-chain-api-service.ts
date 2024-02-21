// @ts-ignore
import getRequestOptions from 'cbridge-revert-manager';
import { Injector } from 'src/core/injector/injector';
import { CbridgeEstimateAmountRequest } from 'src/features/cross-chain/calculation-manager/providers/cbridge/models/cbridge-estimate-amount-request';
import { CbridgeEstimateAmountResponse } from 'src/features/cross-chain/calculation-manager/providers/cbridge/models/cbridge-estimate-amount-response';
import { CbridgeStatusResponse } from 'src/features/cross-chain/calculation-manager/providers/cbridge/models/cbridge-status-response';
import { CbridgeTransferConfigsResponse } from 'src/features/cross-chain/calculation-manager/providers/cbridge/models/cbridge-transfer-configs-response';

export class CbridgeCrossChainApiService {
    private static readonly apiEndpoint = 'https://cbridge-prod2.celer.app/v2/';

    private static readonly testnetApiEndpoint = 'https://cbridge-v2-test.celer.network/v2/';

    public static async getTransferConfigs(options: {
        useTestnet: boolean;
    }): Promise<CbridgeTransferConfigsResponse> {
        const apiUrl = options.useTestnet
            ? CbridgeCrossChainApiService.testnetApiEndpoint
            : CbridgeCrossChainApiService.apiEndpoint;
        return Injector.httpClient.get<CbridgeTransferConfigsResponse>(
            `${apiUrl}getTransferConfigs`
        );
    }

    public static async fetchEstimateAmount(
        requestParams: CbridgeEstimateAmountRequest,
        options: { useTestnet: boolean }
    ): Promise<CbridgeEstimateAmountResponse> {
        const apiUrl = options.useTestnet
            ? CbridgeCrossChainApiService.testnetApiEndpoint
            : CbridgeCrossChainApiService.apiEndpoint;
        return Injector.httpClient.get<CbridgeEstimateAmountResponse>(`${apiUrl}estimateAmt`, {
            params: { ...requestParams }
        });
    }

    public static async fetchTradeStatus(
        transferId: string,
        options: {
            useTestnet: boolean;
        }
    ): Promise<CbridgeStatusResponse> {
        const apiUrl = options.useTestnet
            ? CbridgeCrossChainApiService.testnetApiEndpoint
            : CbridgeCrossChainApiService.apiEndpoint;
        return Injector.httpClient.post<CbridgeStatusResponse>(`${apiUrl}getTransferStatus`, {
            transfer_id: transferId
        });
    }

    public static async withdrawLiquidity(
        transferId: string,
        estimatedReceivedAmt: string,
        options: {
            useTestnet: boolean;
        }
    ): Promise<void> {
        const apiUrl = options.useTestnet
            ? CbridgeCrossChainApiService.testnetApiEndpoint
            : CbridgeCrossChainApiService.apiEndpoint;
        const body: object = await getRequestOptions(transferId, estimatedReceivedAmt);
        return Injector.httpClient.post(`${apiUrl}withdrawLiquidity`, body);
    }
}
