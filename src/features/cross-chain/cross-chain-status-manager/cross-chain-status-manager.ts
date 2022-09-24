/* eslint-disable no-debugger */
import { Injector } from 'src/core/injector/injector';
import {
    BtcStatusResponse,
    CelerXtransferStatusResponse,
    DeBridgeApiResponse,
    DstTxData,
    getDstTxDataFn,
    SymbiosisApiResponse
} from 'src/features/cross-chain/cross-chain-status-manager/models/statuses-api';
import { CrossChainStatus } from 'src/features/cross-chain/cross-chain-status-manager/models/cross-chain-status';
import { BLOCKCHAIN_NAME, EvmBlockchainName } from 'src/core/blockchain/models/blockchain-name';
import { StatusResponse, TransactionStatus } from 'rango-sdk-basic';
import { VIA_DEFAULT_CONFIG } from 'src/features/cross-chain/providers/via-trade-provider/constants/via-default-api-key';
import { RANGO_API_KEY } from 'src/features/cross-chain/providers/rango-trade-provider/constants/rango-api-key';
import { ViaSwapStatus } from 'src/features/cross-chain/providers/via-trade-provider/models/via-swap-status';
import { SymbiosisSwapStatus } from 'src/features/cross-chain/providers/symbiosis-trade-provider/models/symbiosis-swap-status';
import { CrossChainTxStatus } from 'src/features/cross-chain/cross-chain-status-manager/models/cross-chain-tx-status';
import { CrossChainTradeData } from 'src/features/cross-chain/cross-chain-status-manager/models/cross-chain-trade-data';
import { TransactionReceipt } from 'web3-eth';
import {
    CROSS_CHAIN_TRADE_TYPE,
    CrossChainTradeType
} from 'src/features/cross-chain/models/cross-chain-trade-type';
import { LifiSwapStatus } from 'src/features/cross-chain/providers/lifi-trade-provider/models/lifi-swap-status';
import { Via } from '@viaprotocol/router-sdk';
import { blockchainId } from 'src/core/blockchain/utils/blockchains-info/constants/blockchain-id';
import { CelerTransferStatus } from './providers/common/celer-rubic/models/celer-swap-status.enum';

/**
 * Contains methods for getting cross-chain trade statuses.
 */
export class CrossChainStatusManager {
    private readonly httpClient = Injector.httpClient;

    private readonly getDstTxStatusFnMap: Record<CrossChainTradeType, getDstTxDataFn> = {
        [CROSS_CHAIN_TRADE_TYPE.CELER]: this.getCelerDstSwapStatus,
        [CROSS_CHAIN_TRADE_TYPE.LIFI]: this.getLifiDstSwapStatus,
        [CROSS_CHAIN_TRADE_TYPE.SYMBIOSIS]: this.getSymbiosisDstSwapStatus,
        [CROSS_CHAIN_TRADE_TYPE.DEBRIDGE]: this.getDebridgeDstSwapStatus,
        [CROSS_CHAIN_TRADE_TYPE.VIA]: this.getViaDstSwapStatus,
        [CROSS_CHAIN_TRADE_TYPE.RANGO]: this.getRangoDstSwapStatus
    };

    /**
     * Returns cross-chain trade statuses on the source and target network.
     * The result consists of the status of the source and target transactions and destination tx hash.
     * @example
     * ```ts
     * const tradeData = {
     *   fromBlockchain: BLOCKCHAIN_NAME.FANTOM,
     *   toBlockchain: BLOCKCHAIN_NAME.BSC,
     *   txTimestamp: 1658241570024,
     *   srxTxHash: '0xd2263ca82ac0fce606cb75df27d7f0dc94909d41a58c37563bd6772496cb8924'
     * };
     * const provider = CROSS_CHAIN_TRADE_TYPE.VIA;
     * const crossChainStatus = await sdk.crossChainStatusManager.getCrossChainStatus(tradeData, provider);
     * console.log('Source transaction status', crossChainStatus.srcTxStatus);
     * console.log('Destination transaction status', crossChainStatus.dstTxStatus);
     * console.log('Destination transaction hash', crossChainStatus.dstTxHash);
     * ```
     * @param data Data needed to calculate statuses.
     * @param provider Cross-chain trade type.
     * @returns Object with transaction statuses and hash.
     */
    public async getCrossChainStatus(
        data: CrossChainTradeData,
        provider: CrossChainTradeType
    ): Promise<CrossChainStatus> {
        const crossChainStatus: CrossChainStatus = {
            srcTxStatus: CrossChainTxStatus.UNKNOWN,
            dstTxStatus: CrossChainTxStatus.UNKNOWN,
            dstTxHash: null
        };
        const { fromBlockchain, srcTxHash } = data;
        const srcTxReceipt = await this.getTxReceipt(fromBlockchain, srcTxHash as string);
        const srcTxStatus = this.getSrcTxStatus(srcTxReceipt);

        crossChainStatus.srcTxStatus = srcTxStatus;

        const dstTxData = await this.getDstTxStatus(
            srcTxStatus,
            srcTxReceipt as TransactionReceipt,
            data,
            provider
        );

        crossChainStatus.dstTxHash = dstTxData.txHash;

        if (
            dstTxData.txStatus === CrossChainTxStatus.FAIL &&
            srcTxStatus === CrossChainTxStatus.PENDING
        ) {
            crossChainStatus.srcTxStatus = CrossChainTxStatus.FAIL;
        }

        crossChainStatus.dstTxStatus = dstTxData.txStatus;

        return crossChainStatus;
    }

    /**
     * Get cross-chain trade's source transaction status via receipt.
     * @param srcTxReceipt Transaction receipt.
     * @returns Cross-chain transaction status.
     */
    private getSrcTxStatus(srcTxReceipt: TransactionReceipt | null): CrossChainTxStatus {
        if (srcTxReceipt === null) {
            return CrossChainTxStatus.PENDING;
        }

        if (srcTxReceipt.status) {
            return CrossChainTxStatus.SUCCESS;
        }

        return CrossChainTxStatus.FAIL;
    }

    /**
     * Get destination transaction status and hash based on source transaction status,
     * source transaction receipt, trade data and provider type.
     * @param srcTxStatus Source transaction status.
     * @param srcTxReceipt Source transaction receipt.
     * @param tradeData Trade data.
     * @param provider Cross-chain trade type.
     * @returns Cross-chain transaction status and hash.
     */
    private async getDstTxStatus(
        srcTxStatus: CrossChainTxStatus,
        srcTxReceipt: TransactionReceipt,
        tradeData: CrossChainTradeData,
        provider: CrossChainTradeType
    ): Promise<DstTxData> {
        if (srcTxStatus === CrossChainTxStatus.FAIL) {
            return { txHash: null, txStatus: CrossChainTxStatus.FAIL };
        }

        if (srcTxStatus === CrossChainTxStatus.PENDING) {
            return { txHash: null, txStatus: CrossChainTxStatus.PENDING };
        }

        return this.getDstTxStatusFnMap[provider].call(this, tradeData, srcTxReceipt);
    }

    /**
     * Get Rango trade dst transaction status and hash.
     * @param data Trade data.
     * @param srcTxReceipt Source transaction receipt.
     * @returns Cross-chain transaction status and hash.
     */
    private async getRangoDstSwapStatus(
        data: CrossChainTradeData,
        srcTxReceipt: TransactionReceipt
    ): Promise<DstTxData> {
        try {
            const { rangoRequestId: requestId } = data;
            const rangoTradeStatusResponse = await Injector.httpClient.get<StatusResponse>(
                'https://api.rango.exchange/basic/status',
                {
                    params: {
                        apiKey: RANGO_API_KEY,
                        requestId: requestId as string,
                        txId: srcTxReceipt.transactionHash
                    }
                }
            );
            const dstTxData: DstTxData = {
                txStatus: CrossChainTxStatus.UNKNOWN,
                txHash: rangoTradeStatusResponse.bridgeData?.destTxHash || null
            };

            if (rangoTradeStatusResponse.status === TransactionStatus.SUCCESS) {
                dstTxData.txStatus = CrossChainTxStatus.SUCCESS;
            }

            if (rangoTradeStatusResponse.status === TransactionStatus.FAILED) {
                dstTxData.txStatus = CrossChainTxStatus.FAIL;

                const type = rangoTradeStatusResponse?.output?.type;
                if (type === 'MIDDLE_ASSET_IN_SRC' || type === 'MIDDLE_ASSET_IN_DEST') {
                    dstTxData.txStatus = CrossChainTxStatus.FALLBACK;
                }
                if (type === 'REVERTED_TO_INPUT') {
                    dstTxData.txStatus = CrossChainTxStatus.REVERT;
                }
            }

            if (
                rangoTradeStatusResponse.status === TransactionStatus.RUNNING ||
                rangoTradeStatusResponse.status === null
            ) {
                dstTxData.txStatus = CrossChainTxStatus.PENDING;
            }

            return dstTxData;
        } catch {
            return {
                txStatus: CrossChainTxStatus.PENDING,
                txHash: null
            };
        }
    }

    /**
     * Get Symbiosis trade dst transaction status and hash.
     * @param data Trade data.
     * @param srcTxReceipt Source transaction receipt.
     * @returns Cross-chain transaction status and hash.
     */
    private async getSymbiosisDstSwapStatus(
        data: CrossChainTradeData,
        srcTxReceipt: TransactionReceipt
    ): Promise<DstTxData> {
        const symbiosisTxIndexingTimeSpent = Date.now() > data.txTimestamp + 30000;

        if (symbiosisTxIndexingTimeSpent) {
            try {
                const srcChainId = blockchainId[data.fromBlockchain];
                const {
                    status: { text: dstTxStatus },
                    tx: { hash: dstHash }
                } = await Injector.httpClient.get<SymbiosisApiResponse>(
                    `https://api.symbiosis.finance/crosschain/v1/tx/${srcChainId}/${srcTxReceipt.transactionHash}`
                );
                let dstTxData: DstTxData = {
                    txStatus: CrossChainTxStatus.PENDING,
                    txHash: dstHash || null
                };

                if (
                    dstTxStatus === SymbiosisSwapStatus.PENDING ||
                    dstTxStatus === SymbiosisSwapStatus.NOT_FOUND
                ) {
                    dstTxData.txStatus = CrossChainTxStatus.PENDING;
                }

                if (dstTxStatus === SymbiosisSwapStatus.STUCKED) {
                    dstTxData.txStatus = CrossChainTxStatus.REVERT;
                }

                if (dstTxStatus === SymbiosisSwapStatus.REVERTED) {
                    dstTxData.txStatus = CrossChainTxStatus.FALLBACK;
                }

                if (dstTxStatus === SymbiosisSwapStatus.SUCCESS) {
                    if (data.toBlockchain !== BLOCKCHAIN_NAME.BITCOIN) {
                        dstTxData.txStatus = CrossChainTxStatus.SUCCESS;
                    } else {
                        dstTxData = await this.getBitcoinStatus(dstHash);
                    }
                }

                return dstTxData;
            } catch (error) {
                console.debug('[Symbiosis Trade] Error retrieving dst tx status', error);
                return {
                    txStatus: CrossChainTxStatus.PENDING,
                    txHash: null
                };
            }
        }

        return {
            txStatus: CrossChainTxStatus.PENDING,
            txHash: null
        };
    }

    /**
     * Get Li-fi trade dst transaction status and hash.
     * @param data Trade data.
     * @param srcTxReceipt Source transaction receipt.
     * @returns Cross-chain transaction status and hash.
     */
    private async getLifiDstSwapStatus(
        data: CrossChainTradeData,
        srcTxReceipt: TransactionReceipt
    ): Promise<DstTxData> {
        if (!data.lifiBridgeType) {
            return {
                txStatus: CrossChainTxStatus.PENDING,
                txHash: null
            };
        }

        try {
            const params = {
                bridge: data.lifiBridgeType,
                fromChain: blockchainId[data.fromBlockchain],
                toChain: blockchainId[data.toBlockchain],
                txHash: srcTxReceipt.transactionHash
            };
            const { status, receiving } = await Injector.httpClient.get<{
                status: LifiSwapStatus;
                receiving: { txHash: string };
            }>('https://li.quest/v1/status', { params });
            const dstTxData: DstTxData = {
                txStatus: CrossChainTxStatus.UNKNOWN,
                txHash: receiving?.txHash || null
            };

            if (status === LifiSwapStatus.DONE) {
                dstTxData.txStatus = CrossChainTxStatus.SUCCESS;
            }

            if (status === LifiSwapStatus.FAILED) {
                dstTxData.txStatus = CrossChainTxStatus.FAIL;
            }

            if (status === LifiSwapStatus.INVALID) {
                dstTxData.txStatus = CrossChainTxStatus.UNKNOWN;
            }

            if (status === LifiSwapStatus.NOT_FOUND || status === LifiSwapStatus.PENDING) {
                dstTxData.txStatus = CrossChainTxStatus.PENDING;
            }

            return dstTxData;
        } catch (error) {
            console.debug('[Li-fi Trade] error retrieving tx status', error);
            return {
                txStatus: CrossChainTxStatus.PENDING,
                txHash: null
            };
        }
    }

    /**
     * Get Celer trade dst transaction status.
     * @param data Trade data.
     * @param srcTxReceipt Source transaction receipt.
     * @returns Cross-chain transaction status.
     */
    private async getCelerDstSwapStatus(
        data: CrossChainTradeData,
        _srcTxReceipt: TransactionReceipt
    ): Promise<DstTxData> {
        try {
            const dstTxData: DstTxData = {
                txStatus: CrossChainTxStatus.PENDING,
                txHash: null
            };
            const txSearchResult = await Injector.httpClient.get<CelerXtransferStatusResponse>(
                'https://api.celerscan.com/scan/searchByTxHash',
                {
                    params: {
                        tx: data.srcTxHash
                    }
                }
            );

            if (txSearchResult.txSearchInfo.length === 0) {
                return dstTxData;
            }

            const trade = txSearchResult.txSearchInfo[0]!.transfer[0]!;

            if (
                [
                    CelerTransferStatus.XS_UNKNOWN,
                    CelerTransferStatus.XS_WAITING_FOR_SGN_CONFIRMATION,
                    CelerTransferStatus.XS_WAITING_FOR_FUND_RELEASE
                ].includes(trade.xfer_status)
            ) {
                dstTxData.txStatus = CrossChainTxStatus.PENDING;
            }

            if (trade.xfer_status === CelerTransferStatus.XS_COMPLETED) {
                dstTxData.txStatus = CrossChainTxStatus.SUCCESS;
            }

            if (
                [
                    CelerTransferStatus.XS_REFUNDED,
                    CelerTransferStatus.XS_TO_BE_REFUND,
                    CelerTransferStatus.XS_REFUND_TO_BE_CONFIRMED
                ].includes(trade.xfer_status)
            ) {
                dstTxData.txStatus = CrossChainTxStatus.FALLBACK;
            }

            return dstTxData;
        } catch (error) {
            console.debug('[Celer Trade] error retrieving tx status', error);
            return {
                txStatus: CrossChainTxStatus.PENDING,
                txHash: null
            };
        }
    }

    /**
     * Get transaction receipt.
     * @param blockchain Blockchain name.
     * @param txHash Transaction hash.
     * @returns Transaction receipt.
     */
    private async getTxReceipt(
        blockchain: EvmBlockchainName,
        txHash: string
    ): Promise<TransactionReceipt | null> {
        let receipt: TransactionReceipt | null;

        try {
            receipt = await Injector.web3PublicService
                .getWeb3Public(blockchain)
                .getTransactionReceipt(txHash);
        } catch (error) {
            console.debug('Error retrieving src tx receipt', { error, txHash });
            receipt = null;
        }

        return receipt;
    }

    /**
     * Get DeBridge trade dst transaction status and hash.
     * @param _data Trade data.
     * @param srcTxReceipt Source transaction receipt.
     * @returns Cross-chain transaction status and hash.
     */
    private async getDebridgeDstSwapStatus(
        _data: CrossChainTradeData,
        srcTxReceipt: TransactionReceipt
    ): Promise<DstTxData> {
        try {
            const params = { filter: srcTxReceipt.transactionHash, filterType: 1 };
            const { send = null, claim = null } = await this.httpClient.get<DeBridgeApiResponse>(
                'https://api.debridge.finance/api/Transactions/GetFullSubmissionInfo',
                { params }
            );
            const dstTxData: DstTxData = {
                txStatus: CrossChainTxStatus.FAIL,
                txHash: claim?.transactionHash || null
            };

            if (!send || !claim) {
                dstTxData.txStatus = CrossChainTxStatus.PENDING;
            }

            if (claim?.transactionHash) {
                dstTxData.txStatus = CrossChainTxStatus.SUCCESS;
            }

            return dstTxData;
        } catch {
            return {
                txStatus: CrossChainTxStatus.PENDING,
                txHash: null
            };
        }
    }

    /**
     * Get Via trade dst transaction status and hash.
     * @param data Trade data.
     * @param _srcTxReceipt Source transaction receipt.
     * @returns Cross-chain transaction status and hash.
     */
    private async getViaDstSwapStatus(
        data: CrossChainTradeData,
        _srcTxReceipt: TransactionReceipt
    ): Promise<DstTxData> {
        try {
            const txStatusResponse = await new Via(VIA_DEFAULT_CONFIG).checkTx({
                actionUuid: data.viaUuid!
            });
            const status = txStatusResponse.event as unknown as ViaSwapStatus;
            const dstTxData: DstTxData = {
                txStatus: CrossChainTxStatus.PENDING,
                txHash: txStatusResponse.data?.txHash || null
            };

            if (status === ViaSwapStatus.SUCCESS) {
                dstTxData.txStatus = CrossChainTxStatus.SUCCESS;
            }
            if (status === ViaSwapStatus.FAIL) {
                dstTxData.txStatus = CrossChainTxStatus.FAIL;
            }

            return dstTxData;
        } catch {
            return {
                txStatus: CrossChainTxStatus.PENDING,
                txHash: null
            };
        }
    }

    /**
     * @internal
     * Get transaction status in bitcoin network;
     * @param hash Bitcoin transaction hash.
     */
    private async getBitcoinStatus(hash: string): Promise<DstTxData> {
        let bitcoinTransactionStatus: BtcStatusResponse;
        const dstTxData: DstTxData = {
            txStatus: CrossChainTxStatus.PENDING,
            txHash: null
        };
        try {
            const btcStatusApi = 'https://blockchain.info/rawtx/';
            bitcoinTransactionStatus = await this.httpClient.get<BtcStatusResponse>(
                `${btcStatusApi}${hash}`
            );
            dstTxData.txHash = bitcoinTransactionStatus?.hash || null;
        } catch {
            return {
                txStatus: CrossChainTxStatus.PENDING,
                txHash: null
            };
        }

        const isCompleted = bitcoinTransactionStatus?.block_index !== undefined;
        if (isCompleted) {
            dstTxData.txStatus = CrossChainTxStatus.SUCCESS;
        }

        return dstTxData;
    }
}
