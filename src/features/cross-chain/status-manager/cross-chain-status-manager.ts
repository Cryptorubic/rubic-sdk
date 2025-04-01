import { Web3PublicSupportedBlockchain } from 'src/core/blockchain/web3-public-service/models/web3-public-storage';
import {
    TX_STATUS,
    TxStatus
} from 'src/core/blockchain/web3-public-service/web3-public/models/tx-status';
import { Injector } from 'src/core/injector/injector';
import { TxStatusData } from 'src/features/common/status-manager/models/tx-status-data';
import { getSrcTxStatus } from 'src/features/common/status-manager/utils/get-src-tx-status';
import { CrossChainTradeType } from 'src/features/cross-chain/calculation-manager/models/cross-chain-trade-type';
import { CrossChainStatus } from 'src/features/cross-chain/status-manager/models/cross-chain-status';
import { CrossChainTradeData } from 'src/features/cross-chain/status-manager/models/cross-chain-trade-data';

/**
 * Contains methods for getting cross-chain trade statuses.
 */
export class CrossChainStatusManager {
    /**
     * @deprecated Use
     * Returns cross-chain trade statuses on the source and target networks.
     * The result consists of statuses of the source and target transactions and destination tx hash.
     * @example
     * ```ts
     * const tradeData = {
     *   fromBlockchain: BLOCKCHAIN_NAME.FANTOM,
     *   toBlockchain: BLOCKCHAIN_NAME.BSC,
     *   txTimestamp: 1658241570024,
     *   srxTxHash: '0xd2263ca82ac0fce606cb75df27d7f0dc94909d41a58c37563bd6772496cb8924'
     * };
     * const tradeType = CROSS_CHAIN_TRADE_TYPE.VIA;
     * const crossChainStatus = await sdk.crossChainStatusManager.getCrossChainStatus(tradeData, tradeType);
     * console.log('Source transaction status', crossChainStatus.srcTxStatus);
     * console.log('Destination transaction status', crossChainStatus.dstTxStatus);
     * console.log('Destination transaction hash', crossChainStatus.dstTxHash);
     * ```
     * @param data Data needed to calculate statuses.
     * @param tradeType Cross-chain trade type.
     * @returns Object with transaction statuses and hash.
     */
    public async getCrossChainStatus(
        data: CrossChainTradeData,
        tradeType: CrossChainTradeType
    ): Promise<CrossChainStatus> {
        const { fromBlockchain, srcTxHash } = data;
        let srcTxStatus = await getSrcTxStatus(fromBlockchain, srcTxHash);

        const dstTxData = await this.getDstTxData(srcTxStatus, data, tradeType);
        if (dstTxData.status === TX_STATUS.FAIL && srcTxStatus === TX_STATUS.PENDING) {
            srcTxStatus = TX_STATUS.FAIL;
        }

        return {
            srcTxStatus,
            dstTxStatus: dstTxData.status,
            dstTxHash: dstTxData.hash,
            ...(dstTxData.extraInfo && { extraInfo: dstTxData.extraInfo })
        };
    }

    public async getCrossChainStatusExtended(
        rubicId: string,
        srcHash: string,
        fromBlockchain: Web3PublicSupportedBlockchain
    ): Promise<CrossChainStatus> {
        let srcTxStatus = await getSrcTxStatus(fromBlockchain, srcHash);

        const dstTxData = await this.getDstTxDataExtended(srcTxStatus, rubicId, srcHash);
        if (dstTxData.status === TX_STATUS.FAIL && srcTxStatus === TX_STATUS.PENDING) {
            srcTxStatus = TX_STATUS.FAIL;
        }

        return {
            srcTxStatus,
            dstTxStatus: dstTxData.status,
            dstTxHash: dstTxData.hash,
            ...(dstTxData.extraInfo && { extraInfo: dstTxData.extraInfo })
        };
    }

    private async getDstTxDataExtended(
        srcTxStatus: TxStatus,
        rubicId: string,
        srcHash: string
    ): Promise<TxStatusData> {
        if (srcTxStatus === TX_STATUS.FAIL) {
            return { hash: null, status: TX_STATUS.FAIL };
        }

        if (srcTxStatus === TX_STATUS.PENDING) {
            return { hash: null, status: TX_STATUS.PENDING };
        }

        const txStatusData = await Injector.rubicApiService.fetchCrossChainTxStatusExtended(
            srcHash,
            rubicId
        );

        if (txStatusData.status === TX_STATUS.SUCCESS) {
            return {
                status: TX_STATUS.SUCCESS,
                hash: txStatusData.destinationTxHash
            };
        }

        if (txStatusData.status === 'REVERTED') {
            return {
                status: TX_STATUS.FALLBACK,
                hash: txStatusData.destinationTxHash
            };
        }

        if (txStatusData.status === 'NOT_FOUND' || txStatusData.status === 'LONG_PENDING') {
            return {
                status: TX_STATUS.PENDING,
                hash: null
            };
        }

        return {
            status: txStatusData.status,
            hash: txStatusData.destinationTxHash
        };
    }

    /**
     * @deprecated
     * Get destination transaction status and hash based on source transaction status,
     * source transaction receipt, trade data and type.
     * @param srcTxStatus Source transaction status.
     * @param tradeData Trade data.
     * @param tradeType Cross-chain trade type.
     * @returns Cross-chain transaction status and hash.
     */
    private async getDstTxData(
        srcTxStatus: TxStatus,
        tradeData: CrossChainTradeData,
        _tradeType: CrossChainTradeType
    ): Promise<TxStatusData> {
        if (srcTxStatus === TX_STATUS.FAIL) {
            return { hash: null, status: TX_STATUS.FAIL };
        }

        if (srcTxStatus === TX_STATUS.PENDING) {
            return { hash: null, status: TX_STATUS.PENDING };
        }

        const txStatusData = await Injector.rubicApiService.fetchCrossChainTxStatus(
            tradeData.srcTxHash
        );

        if (txStatusData.status === TX_STATUS.SUCCESS) {
            return {
                status: TX_STATUS.SUCCESS,
                hash: txStatusData.destinationTxHash
            };
        }

        if (txStatusData.status === 'REVERTED') {
            return {
                status: TX_STATUS.FALLBACK,
                hash: txStatusData.destinationTxHash
            };
        }

        if (txStatusData.status === 'NOT_FOUND' || txStatusData.status === 'LONG_PENDING') {
            return {
                status: TX_STATUS.PENDING,
                hash: null
            };
        }

        return {
            status: txStatusData.status,
            hash: txStatusData.destinationTxHash
        };
    }
}
