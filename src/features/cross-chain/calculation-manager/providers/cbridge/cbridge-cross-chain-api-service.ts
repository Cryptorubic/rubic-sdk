import { Injector } from 'src/core/injector/injector';
import { CbridgeChainTokenInfo } from 'src/features/cross-chain/calculation-manager/providers/cbridge/models/cbridge-chain-token-info';
import { CbridgeEstimateAmountRequest } from 'src/features/cross-chain/calculation-manager/providers/cbridge/models/cbridge-estimate-amount-request';
import { CbridgeEstimateAmountResponse } from 'src/features/cross-chain/calculation-manager/providers/cbridge/models/cbridge-estimate-amount-response';
import { CbridgeStatusResponse } from 'src/features/cross-chain/calculation-manager/providers/cbridge/models/cbridge-status-response';
import { CbridgeTransferConfigsResponse } from 'src/features/cross-chain/calculation-manager/providers/cbridge/models/cbridge-transfer-configs-response';

export class CbridgeCrossChainApiService {
    public static readonly apiEndpoint = 'https://cbridge-prod2.celer.app/v2/';

    public static async getTransferConfigs(): Promise<CbridgeTransferConfigsResponse> {
        return Injector.httpClient
            .get<CbridgeTransferConfigsResponse>(
                `${CbridgeCrossChainApiService.apiEndpoint}getTransferConfigs`
            )
            .then(config => {
                return {
                    ...config,
                    chain_token: {
                        ...config.chain_token,
                        592: {
                            token: [
                                ...(config.chain_token[592] as CbridgeChainTokenInfo).token,
                                {
                                    delay_period: 0,
                                    delay_threshold: '',
                                    icon: 'https://get.celer.app/cbridge-icons/BUSD.png',
                                    inbound_epoch_cap: '',
                                    inbound_lmt: '',
                                    liq_add_disabled: false,
                                    liq_agg_rm_src_disabled: false,
                                    liq_rm_disabled: false,
                                    name: 'BUSD',
                                    token: {
                                        address: '0x4Bf769b05E832FCdc9053fFFBC78Ca889aCb5E1E',
                                        decimal: 18,
                                        symbol: 'BUSD',
                                        xfer_disabled: false
                                    },
                                    transfer_disabled: false
                                }
                            ]
                        }
                    }
                };
            });
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
