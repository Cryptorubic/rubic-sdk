import { TX_STATUS } from 'src/core/blockchain/web3-public-service/web3-public/models/tx-status';
import { Injector } from 'src/core/injector/injector';
import { toBridgersBlockchain } from 'src/features/common/providers/bridgers/constants/to-bridgers-blockchain';
import {
    BridgersGetTransDataByIdRequest,
    BridgersGetTransDataByIdResponse
} from 'src/features/common/providers/bridgers/models/bridgers-get-trans-data-by-id-api';
import {
    BridgersUpdateDataAndStatusRequest,
    BridgersUpdateDataAndStatusResponse
} from 'src/features/common/providers/bridgers/models/bridgers-update-data-and-status-api';
import { TxStatusData } from 'src/features/common/status-manager/models/tx-status-data';
import { BridgersCrossChainSupportedBlockchain } from 'src/features/cross-chain/calculation-manager/providers/bridgers-provider/constants/bridgers-cross-chain-supported-blockchain';

export async function getBridgersTradeStatus(
    srcTxHash: string,
    fromBlockchain: BridgersCrossChainSupportedBlockchain,
    sourceFlag: 'rubic' | 'rubic_widget',
    slippage?: number
): Promise<TxStatusData> {
    try {
        const updateDataAndStatusRequest: BridgersUpdateDataAndStatusRequest = {
            hash: srcTxHash,
            fromTokenChain: toBridgersBlockchain[fromBlockchain],
            sourceFlag,
            ...(slippage && { slippage: slippage.toString() })
        };
        const updateDataAndStatusResponse =
            await Injector.httpClient.post<BridgersUpdateDataAndStatusResponse>(
                'https://sswap.swft.pro/api/exchangeRecord/updateDataAndStatus',
                updateDataAndStatusRequest
            );
        const orderId = updateDataAndStatusResponse.data?.orderId;
        if (!orderId) {
            return {
                status: TX_STATUS.PENDING,
                hash: null
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
                status: TX_STATUS.PENDING,
                hash: null
            };
        }

        if (transactionData.status === 'receive_complete') {
            return {
                status: TX_STATUS.SUCCESS,
                hash: transactionData.toHash
            };
        }
        if (transactionData.status.includes('error') || transactionData.status.includes('fail')) {
            return {
                status: TX_STATUS.FAIL,
                hash: null
            };
        }
    } catch (err) {
        console.debug('[ERROR_getBridgersTradeStatus]', err);
    }

    return {
        status: TX_STATUS.PENDING,
        hash: null
    };
}
