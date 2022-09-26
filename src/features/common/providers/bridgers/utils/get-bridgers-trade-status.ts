import {
    BridgersUpdateDataAndStatusRequest,
    BridgersUpdateDataAndStatusResponse
} from 'src/features/common/providers/bridgers/models/bridgers-update-data-and-status';
import { toBridgersBlockchain } from 'src/features/common/providers/bridgers/constants/to-bridgers-blockchain';
import { BridgersCrossChainSupportedBlockchain } from 'src/features/cross-chain/providers/bridgers-provider/constants/bridgers-cross-chain-supported-blockchain';
import { Injector } from 'src/core/injector/injector';
import { TxStatus } from 'src/core/blockchain/web3-public-service/web3-public/models/tx-status';
import {
    BridgersGetTransDataByIdRequest,
    BridgersGetTransDataByIdResponse
} from 'src/features/common/providers/bridgers/models/bridgers-get-trans-data-by-id';
import { DstTxData } from 'src/features/cross-chain/cross-chain-status-manager/models/statuses-api';

export async function getBridgersTradeStatus(
    srcTxHash: string,
    fromBlockchain: BridgersCrossChainSupportedBlockchain,
    sourceFlag: 'rubic' | 'rubic_widget'
): Promise<DstTxData> {
    try {
        const updateDataAndStatusRequest: BridgersUpdateDataAndStatusRequest = {
            hash: srcTxHash,
            fromTokenChain: toBridgersBlockchain[fromBlockchain],
            sourceFlag
        };
        const updateDataAndStatusResponse =
            await Injector.httpClient.post<BridgersUpdateDataAndStatusResponse>(
                'https://sswap.swft.pro/api/exchangeRecord/updateDataAndStatus',
                updateDataAndStatusRequest
            );
        const orderId = updateDataAndStatusResponse.data?.orderId;
        if (!orderId) {
            return {
                txStatus: TxStatus.PENDING,
                txHash: null
            };
        }

        const getTransDataByIdRequest: BridgersGetTransDataByIdRequest = {
            orderId
        };
        const getTransDataByIdResponse =
            await Injector.httpClient.post<BridgersGetTransDataByIdResponse>(
                'https://sswap.swft.pro/api/exchangeRecord/getTransDataById',
                getTransDataByIdRequest
            );
        const transactionData = getTransDataByIdResponse.data;
        if (!transactionData?.status) {
            return {
                txStatus: TxStatus.PENDING,
                txHash: null
            };
        }

        if (transactionData.status === 'receive_complete') {
            return {
                txStatus: TxStatus.SUCCESS,
                txHash: transactionData.toHash
            };
        }
        if (transactionData.status.includes('error') || transactionData.status.includes('fail')) {
            return {
                txStatus: TxStatus.FAIL,
                txHash: null
            };
        }
    } catch {}

    return {
        txStatus: TxStatus.PENDING,
        txHash: null
    };
}
