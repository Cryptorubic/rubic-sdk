import {
    L1ToL2MessageStatus,
    L1TransactionReceipt,
    L2ToL1MessageReader,
    L2ToL1MessageStatus,
    L2TransactionReceipt
} from '@arbitrum/sdk';
import { JsonRpcProvider } from '@ethersproject/providers';
import { createClient } from '@layerzerolabs/scan-client';
import { Via } from '@viaprotocol/router-sdk';
import { StatusResponse, TransactionStatus } from 'rango-sdk-basic';
import { RubicSdkError } from 'src/common/errors';
import {
    BLOCKCHAIN_NAME,
    TEST_EVM_BLOCKCHAIN_NAME
} from 'src/core/blockchain/models/blockchain-name';
import { blockchainId } from 'src/core/blockchain/utils/blockchains-info/constants/blockchain-id';
import { TxStatus } from 'src/core/blockchain/web3-public-service/web3-public/models/tx-status';
import { Injector } from 'src/core/injector/injector';
import { changenowApiKey } from 'src/features/common/providers/changenow/constants/changenow-api-key';
import { TxStatusData } from 'src/features/common/status-manager/models/tx-status-data';
import { getBridgersTradeStatus } from 'src/features/common/status-manager/utils/get-bridgers-trade-status';
import { getSrcTxStatus } from 'src/features/common/status-manager/utils/get-src-tx-status';
import {
    CROSS_CHAIN_TRADE_TYPE,
    CrossChainTradeType
} from 'src/features/cross-chain/calculation-manager/models/cross-chain-trade-type';
import { BridgersCrossChainSupportedBlockchain } from 'src/features/cross-chain/calculation-manager/providers/bridgers-provider/constants/bridgers-cross-chain-supported-blockchain';
import { CbridgeCrossChainApiService } from 'src/features/cross-chain/calculation-manager/providers/cbridge/cbridge-cross-chain-api-service';
import { CbridgeCrossChainSupportedBlockchain } from 'src/features/cross-chain/calculation-manager/providers/cbridge/constants/cbridge-supported-blockchains';
import {
    TransferHistoryStatus,
    XferStatus
} from 'src/features/cross-chain/calculation-manager/providers/cbridge/models/cbridge-status-response';
import { DebridgeCrossChainProvider } from 'src/features/cross-chain/calculation-manager/providers/debridge-provider/debridge-cross-chain-provider';
import { LifiSwapStatus } from 'src/features/cross-chain/calculation-manager/providers/lifi-provider/models/lifi-swap-status';
import { RANGO_API_KEY } from 'src/features/cross-chain/calculation-manager/providers/rango-provider/constants/rango-api-key';
import { SymbiosisSwapStatus } from 'src/features/cross-chain/calculation-manager/providers/symbiosis-provider/models/symbiosis-swap-status';
import { VIA_DEFAULT_CONFIG } from 'src/features/cross-chain/calculation-manager/providers/via-provider/constants/via-default-api-key';
import { ViaSwapStatus } from 'src/features/cross-chain/calculation-manager/providers/via-provider/models/via-swap-status';
import { XyCrossChainProvider } from 'src/features/cross-chain/calculation-manager/providers/xy-provider/xy-cross-chain-provider';
import { CrossChainCbridgeManager } from 'src/features/cross-chain/cbridge-manager/cross-chain-cbridge-manager';
import { MultichainStatusMapping } from 'src/features/cross-chain/status-manager/constants/multichain-status-mapping';
import {
    ChangenowApiResponse,
    ChangenowApiStatus
} from 'src/features/cross-chain/status-manager/models/changenow-api-response';
import { CrossChainStatus } from 'src/features/cross-chain/status-manager/models/cross-chain-status';
import { CrossChainTradeData } from 'src/features/cross-chain/status-manager/models/cross-chain-trade-data';
import { MultichainStatusApiResponse } from 'src/features/cross-chain/status-manager/models/multichain-status-api-response';
import { ScrollApiResponse } from 'src/features/cross-chain/status-manager/models/scroll-api-response';
import {
    BtcStatusResponse,
    DeBridgeApiStateStatus,
    DeBridgeFilteredListApiResponse,
    DeBridgeOrderApiResponse,
    DeBridgeOrderApiStatusResponse,
    GetDstTxDataFn,
    SymbiosisApiResponse
} from 'src/features/cross-chain/status-manager/models/statuses-api';
import { XyApiResponse } from 'src/features/cross-chain/status-manager/models/xy-api-response';

/**
 * Contains methods for getting cross-chain trade statuses.
 */
export class CrossChainStatusManager {
    private readonly httpClient = Injector.httpClient;

    private readonly LayzerZeroScanClient = createClient('mainnet');

    private readonly getDstTxStatusFnMap: Record<CrossChainTradeType, GetDstTxDataFn | null> = {
        [CROSS_CHAIN_TRADE_TYPE.LIFI]: this.getLifiDstSwapStatus,
        [CROSS_CHAIN_TRADE_TYPE.SYMBIOSIS]: this.getSymbiosisDstSwapStatus,
        [CROSS_CHAIN_TRADE_TYPE.DEBRIDGE]: this.getDebridgeDstSwapStatus,
        [CROSS_CHAIN_TRADE_TYPE.VIA]: this.getViaDstSwapStatus,
        [CROSS_CHAIN_TRADE_TYPE.RANGO]: this.getRangoDstSwapStatus,
        [CROSS_CHAIN_TRADE_TYPE.BRIDGERS]: this.getBridgersDstSwapStatus,
        [CROSS_CHAIN_TRADE_TYPE.MULTICHAIN]: this.getMultichainDstSwapStatus,
        [CROSS_CHAIN_TRADE_TYPE.XY]: this.getXyDstSwapStatus,
        [CROSS_CHAIN_TRADE_TYPE.CELER_BRIDGE]: this.getCelerBridgeDstSwapStatus,
        [CROSS_CHAIN_TRADE_TYPE.CHANGENOW]: this.getChangenowDstSwapStatus,
        [CROSS_CHAIN_TRADE_TYPE.STARGATE]: this.getStargateDstSwapStatus,
        [CROSS_CHAIN_TRADE_TYPE.ARBITRUM]: this.getArbitrumBridgeDstSwapStatus,
        [CROSS_CHAIN_TRADE_TYPE.SCROLL_BRIDGE]: this.getScrollBridgeDstSwapStatus
    };

    /**
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
        if (dstTxData.status === TxStatus.FAIL && srcTxStatus === TxStatus.PENDING) {
            srcTxStatus = TxStatus.FAIL;
        }

        return {
            srcTxStatus,
            dstTxStatus: dstTxData.status,
            dstTxHash: dstTxData.hash
        };
    }

    /**
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
        tradeType: CrossChainTradeType
    ): Promise<TxStatusData> {
        if (srcTxStatus === TxStatus.FAIL) {
            return { hash: null, status: TxStatus.FAIL };
        }

        if (srcTxStatus === TxStatus.PENDING) {
            return { hash: null, status: TxStatus.PENDING };
        }

        const getDstTxStatusFn = this.getDstTxStatusFnMap[tradeType];
        if (!getDstTxStatusFn) {
            throw new RubicSdkError('Unsupported cross chain provider');
        }

        return getDstTxStatusFn.call(this, tradeData);
    }

    /**
     * Get Stargate trade dst transaction status and hash.
     * @param data Trade data.
     * @returns Cross-chain transaction status and hash.
     */
    private async getStargateDstSwapStatus(data: CrossChainTradeData): Promise<TxStatusData> {
        const scanResponse = await this.LayzerZeroScanClient.getMessagesBySrcTxHash(data.srcTxHash);
        const targetTrade = scanResponse.messages.find(
            item => item.srcTxHash.toLocaleLowerCase() === data.srcTxHash.toLocaleLowerCase()
        );
        const txStatusData: TxStatusData = {
            status: TxStatus.PENDING,
            hash: null
        };

        if (targetTrade?.dstTxHash) {
            txStatusData.hash = targetTrade.dstTxHash;
        }

        if (targetTrade?.status === 'DELIVERED') {
            txStatusData.status = TxStatus.SUCCESS;
        }

        if (targetTrade?.status === 'INFLIGHT') {
            txStatusData.status = TxStatus.PENDING;
        }

        if (targetTrade?.status === 'FAILED') {
            txStatusData.status = TxStatus.FAIL;
        }

        return txStatusData;
    }

    /**
     * Get Rango trade dst transaction status and hash.
     * @param data Trade data.
     * @returns Cross-chain transaction status and hash.
     */
    private async getRangoDstSwapStatus(data: CrossChainTradeData): Promise<TxStatusData> {
        try {
            const { rangoRequestId: requestId } = data;
            const rangoTradeStatusResponse = await Injector.httpClient.get<StatusResponse>(
                'https://api.rango.exchange/basic/status',
                {
                    params: {
                        apiKey: RANGO_API_KEY,
                        requestId: requestId as string,
                        txId: data.srcTxHash
                    }
                }
            );
            const dstTxData: TxStatusData = {
                status: TxStatus.UNKNOWN,
                hash: rangoTradeStatusResponse.bridgeData?.destTxHash || null
            };

            if (rangoTradeStatusResponse.status === TransactionStatus.SUCCESS) {
                dstTxData.status = TxStatus.SUCCESS;
            }

            if (rangoTradeStatusResponse.status === TransactionStatus.FAILED) {
                dstTxData.status = TxStatus.FAIL;

                const type = rangoTradeStatusResponse?.output?.type;
                if (type === 'MIDDLE_ASSET_IN_SRC' || type === 'MIDDLE_ASSET_IN_DEST') {
                    dstTxData.status = TxStatus.FALLBACK;
                }
                if (type === 'REVERTED_TO_INPUT') {
                    dstTxData.status = TxStatus.REVERT;
                }
            }

            if (
                rangoTradeStatusResponse.status === TransactionStatus.RUNNING ||
                rangoTradeStatusResponse.status === null
            ) {
                dstTxData.status = TxStatus.PENDING;
            }

            return dstTxData;
        } catch {
            return {
                status: TxStatus.PENDING,
                hash: null
            };
        }
    }

    /**
     * Get Symbiosis trade dst transaction status and hash.
     * @param data Trade data.
     * @returns Cross-chain transaction status and hash.
     */
    private async getSymbiosisDstSwapStatus(data: CrossChainTradeData): Promise<TxStatusData> {
        const symbiosisTxIndexingTimeSpent = Date.now() > data.txTimestamp + 30000;

        if (symbiosisTxIndexingTimeSpent) {
            try {
                const srcChainId = blockchainId[data.fromBlockchain];
                const toBlockchainId = blockchainId[data.toBlockchain];
                const {
                    status: { text: dstTxStatus },
                    tx
                } = await Injector.httpClient.get<SymbiosisApiResponse>(
                    `https://api-v2.symbiosis.finance/crosschain/v1/tx/${srcChainId}/${data.srcTxHash}`
                );
                let dstTxData: TxStatusData = {
                    status: TxStatus.PENDING,
                    hash: tx?.hash || null
                };

                const targetTokenNetwork = tx?.chainId;

                if (
                    dstTxStatus === SymbiosisSwapStatus.PENDING ||
                    dstTxStatus === SymbiosisSwapStatus.NOT_FOUND
                ) {
                    return { ...dstTxData, status: TxStatus.PENDING };
                }

                if (dstTxStatus === SymbiosisSwapStatus.STUCKED) {
                    return { ...dstTxData, status: TxStatus.REVERT };
                }

                if (dstTxStatus === SymbiosisSwapStatus.REVERTED) {
                    return { ...dstTxData, status: TxStatus.FALLBACK };
                }

                if (
                    dstTxStatus === SymbiosisSwapStatus.SUCCESS &&
                    targetTokenNetwork === toBlockchainId
                ) {
                    if (data.toBlockchain !== BLOCKCHAIN_NAME.BITCOIN) {
                        dstTxData.status = TxStatus.SUCCESS;
                    } else {
                        dstTxData = await this.getBitcoinStatus(tx!.hash);
                    }
                }

                return dstTxData;
            } catch (error) {
                console.debug('[Symbiosis Trade] Error retrieving dst tx status', error);
                return {
                    status: TxStatus.PENDING,
                    hash: null
                };
            }
        }

        return {
            status: TxStatus.PENDING,
            hash: null
        };
    }

    /**
     * Get Li-fi trade dst transaction status and hash.
     * @param data Trade data.
     * @returns Cross-chain transaction status and hash.
     */
    private async getLifiDstSwapStatus(data: CrossChainTradeData): Promise<TxStatusData> {
        if (!data.lifiBridgeType) {
            return {
                status: TxStatus.PENDING,
                hash: null
            };
        }

        try {
            const params = {
                bridge: data.lifiBridgeType,
                fromChain: blockchainId[data.fromBlockchain],
                toChain: blockchainId[data.toBlockchain],
                txHash: data.srcTxHash
            };
            const { status, receiving } = await Injector.httpClient.get<{
                status: LifiSwapStatus;
                receiving: { txHash: string };
            }>('https://li.quest/v1/status', { params });
            const dstTxData: TxStatusData = {
                status: TxStatus.UNKNOWN,
                hash: receiving?.txHash || null
            };

            if (status === LifiSwapStatus.DONE) {
                dstTxData.status = TxStatus.SUCCESS;
            }

            if (status === LifiSwapStatus.FAILED) {
                dstTxData.status = TxStatus.FAIL;
            }

            if (status === LifiSwapStatus.INVALID) {
                dstTxData.status = TxStatus.UNKNOWN;
            }

            if (status === LifiSwapStatus.NOT_FOUND || status === LifiSwapStatus.PENDING) {
                dstTxData.status = TxStatus.PENDING;
            }

            return dstTxData;
        } catch (error) {
            console.debug('[Li-fi Trade] error retrieving tx status', error);
            return {
                status: TxStatus.PENDING,
                hash: null
            };
        }
    }

    /**
     * Get DeBridge trade dst transaction status.
     * @param data Trade data.
     * @returns Cross-chain transaction status and hash.
     */
    private async getDebridgeDstSwapStatus(data: CrossChainTradeData): Promise<TxStatusData> {
        try {
            const { orderIds } = await this.httpClient.get<DeBridgeFilteredListApiResponse>(
                `${DebridgeCrossChainProvider.apiEndpoint}/tx/${data.srcTxHash}/order-ids`
            );

            if (!orderIds.length) {
                return {
                    status: TxStatus.PENDING,
                    hash: null
                };
            }

            const orderId = orderIds[0];
            const dstTxData: TxStatusData = {
                status: TxStatus.PENDING,
                hash: null
            };

            const { status } = await this.httpClient.get<DeBridgeOrderApiStatusResponse>(
                `${DebridgeCrossChainProvider.apiEndpoint}/order/${orderId}/status`
            );

            if (
                status === DeBridgeApiStateStatus.FULFILLED ||
                status === DeBridgeApiStateStatus.SENTUNLOCK ||
                status === DeBridgeApiStateStatus.CLAIMEDUNLOCK
            ) {
                const { fulfilledDstEventMetadata } =
                    await this.httpClient.get<DeBridgeOrderApiResponse>(
                        `https://stats-api.dln.trade/api/Orders/${orderId}`
                    );

                dstTxData.hash = fulfilledDstEventMetadata.transactionHash.stringValue;
                dstTxData.status = TxStatus.SUCCESS;
            } else if (
                status === DeBridgeApiStateStatus.ORDERCANCELLED ||
                status === DeBridgeApiStateStatus.SENTORDERCANCEL ||
                status === DeBridgeApiStateStatus.CLAIMEDORDERCANCEL
            ) {
                dstTxData.status = TxStatus.FAIL;
            }

            return dstTxData;
        } catch {
            return {
                status: TxStatus.PENDING,
                hash: null
            };
        }
    }

    /**
     * Get Via trade dst transaction status and hash.
     * @param data Trade data.
     * @returns Cross-chain transaction status and hash.
     */
    private async getViaDstSwapStatus(data: CrossChainTradeData): Promise<TxStatusData> {
        try {
            const txStatusResponse = await new Via(VIA_DEFAULT_CONFIG).checkTx({
                actionUuid: data.viaUuid!
            });
            const status = txStatusResponse.event as unknown as ViaSwapStatus;
            const dstTxData: TxStatusData = {
                status: TxStatus.PENDING,
                hash: txStatusResponse.data?.txHash || null
            };

            if (status === ViaSwapStatus.SUCCESS) {
                dstTxData.status = TxStatus.SUCCESS;
            }
            if (status === ViaSwapStatus.FAIL) {
                dstTxData.status = TxStatus.FAIL;
            }

            return dstTxData;
        } catch {
            return {
                status: TxStatus.PENDING,
                hash: null
            };
        }
    }

    /**
     * Get Bridgers trade dst transaction status.
     * @param data Trade data.
     * @returns Cross-chain transaction status.
     */
    private getBridgersDstSwapStatus(data: CrossChainTradeData): Promise<TxStatusData> {
        if (!data.amountOutMin) {
            throw new RubicSdkError('field amountOutMin is not set.');
        }
        return getBridgersTradeStatus(
            data.srcTxHash,
            data.fromBlockchain as BridgersCrossChainSupportedBlockchain,
            'rubic',
            data.amountOutMin
        );
    }

    /**
     * @internal
     * Get transaction status in bitcoin network;
     * @param hash Bitcoin transaction hash.
     */
    private async getBitcoinStatus(hash: string): Promise<TxStatusData> {
        let bitcoinTransactionStatus: BtcStatusResponse;
        const dstTxData: TxStatusData = {
            status: TxStatus.PENDING,
            hash: null
        };
        try {
            const btcStatusApi = 'https://blockchain.info/rawtx/';
            bitcoinTransactionStatus = await this.httpClient.get<BtcStatusResponse>(
                `${btcStatusApi}${hash}`
            );
            dstTxData.hash = bitcoinTransactionStatus?.hash || null;
        } catch {
            return {
                status: TxStatus.PENDING,
                hash: null
            };
        }

        const isCompleted = bitcoinTransactionStatus?.block_index !== undefined;
        if (isCompleted) {
            dstTxData.status = TxStatus.SUCCESS;
        }

        return dstTxData;
    }

    private async getMultichainDstSwapStatus(data: CrossChainTradeData): Promise<TxStatusData> {
        try {
            const {
                info: { status, swaptx }
            } = await this.httpClient.get<MultichainStatusApiResponse>(
                `https://bridgeapi.anyswap.exchange/v2/history/details?params=${data.srcTxHash}`
            );

            return {
                status: MultichainStatusMapping?.[status] || TxStatus.PENDING,
                hash: swaptx || null
            };
        } catch {
            return {
                status: TxStatus.PENDING,
                hash: null
            };
        }
    }

    private async getXyDstSwapStatus(data: CrossChainTradeData): Promise<TxStatusData> {
        try {
            const { isSuccess, status, txHash } = await this.httpClient.get<XyApiResponse>(
                `${XyCrossChainProvider.apiEndpoint}/crossChainStatus?srcChainId=${
                    blockchainId[data.fromBlockchain]
                }&transactionHash=${data.srcTxHash}`
            );

            if (isSuccess && status === 'Done') {
                return { status: TxStatus.SUCCESS, hash: txHash };
            }

            if (!isSuccess) {
                return { status: TxStatus.FAIL, hash: null };
            }
            return { status: TxStatus.PENDING, hash: null };
        } catch {
            return { status: TxStatus.PENDING, hash: null };
        }
    }

    private async getCelerBridgeDstSwapStatus(data: CrossChainTradeData): Promise<TxStatusData> {
        try {
            const transferId = await CrossChainCbridgeManager.getTransferId(
                data.srcTxHash,
                data.fromBlockchain as CbridgeCrossChainSupportedBlockchain
            );
            const useTestnet = data.fromBlockchain in TEST_EVM_BLOCKCHAIN_NAME;
            const swapData = await CbridgeCrossChainApiService.fetchTradeStatus(transferId, {
                useTestnet
            });

            switch (swapData.status) {
                case TransferHistoryStatus.TRANSFER_UNKNOWN:
                case TransferHistoryStatus.TRANSFER_SUBMITTING:
                case TransferHistoryStatus.TRANSFER_WAITING_FOR_SGN_CONFIRMATION:
                case TransferHistoryStatus.TRANSFER_REQUESTING_REFUND:
                case TransferHistoryStatus.TRANSFER_CONFIRMING_YOUR_REFUND:
                default:
                    return { status: TxStatus.PENDING, hash: null };
                case TransferHistoryStatus.TRANSFER_REFUNDED:
                case TransferHistoryStatus.TRANSFER_COMPLETED:
                    return {
                        status: TxStatus.SUCCESS,
                        hash: swapData.dst_block_tx_link.split('/').at(-1)!
                    };
                case TransferHistoryStatus.TRANSFER_FAILED:
                    return {
                        status: TxStatus.FAIL,
                        hash: null
                    };
                case TransferHistoryStatus.TRANSFER_WAITING_FOR_FUND_RELEASE:
                case TransferHistoryStatus.TRANSFER_TO_BE_REFUNDED:
                    return swapData.refund_reason === XferStatus.OK_TO_RELAY
                        ? {
                              status: TxStatus.PENDING,
                              hash: null
                          }
                        : {
                              status: TxStatus.REVERT,
                              hash: null
                          };
            }
        } catch {
            return { status: TxStatus.PENDING, hash: null };
        }
    }

    private async getChangenowDstSwapStatus(data: CrossChainTradeData): Promise<TxStatusData> {
        if (!data.changenowId) {
            throw new RubicSdkError('Must provide changenow trade id');
        }
        try {
            const { status, payoutHash } = await this.httpClient.get<ChangenowApiResponse>(
                'https://api.changenow.io/v2/exchange/by-id',
                {
                    params: { id: data.changenowId },
                    headers: { 'x-changenow-api-key': changenowApiKey }
                }
            );

            if (status === ChangenowApiStatus.FINISHED || status === ChangenowApiStatus.REFUNDED) {
                return { status: TxStatus.SUCCESS, hash: payoutHash };
            }
            if (status === ChangenowApiStatus.FAILED) {
                return { status: TxStatus.FAIL, hash: null };
            }
            return { status: TxStatus.PENDING, hash: null };
        } catch {
            return { status: TxStatus.PENDING, hash: null };
        }
    }

    public async getArbitrumBridgeDstSwapStatus(data: CrossChainTradeData): Promise<TxStatusData> {
        const rpcProviders = Injector.web3PublicService.rpcProvider;
        const l1Provider = new JsonRpcProvider(
            rpcProviders[BLOCKCHAIN_NAME.ETHEREUM]!.rpcList[0]!,
            1
        );
        const l2Provider = new JsonRpcProvider(
            rpcProviders[BLOCKCHAIN_NAME.ARBITRUM]!.rpcList[0]!,
            42161
        );
        // L1 to L2 deposit
        if (data.fromBlockchain === BLOCKCHAIN_NAME.ETHEREUM) {
            try {
                const sourceTx = await l1Provider.getTransactionReceipt(data.srcTxHash);
                const l1TxReceipt = new L1TransactionReceipt(sourceTx);

                const [l1ToL2Msg] = await l1TxReceipt.getL1ToL2Messages(l2Provider);
                const response = await l1ToL2Msg!.getSuccessfulRedeem();

                switch (response.status) {
                    case L1ToL2MessageStatus.FUNDS_DEPOSITED_ON_L2:
                        return { status: TxStatus.REVERT, hash: null };
                    case L1ToL2MessageStatus.EXPIRED:
                    case L1ToL2MessageStatus.CREATION_FAILED:
                        return { status: TxStatus.FAIL, hash: null };
                    case L1ToL2MessageStatus.REDEEMED:
                        return {
                            status: TxStatus.SUCCESS,
                            hash: response.l2TxReceipt.transactionHash
                        };
                    case L1ToL2MessageStatus.NOT_YET_CREATED:
                    default:
                        return { status: TxStatus.PENDING, hash: null };
                }
            } catch {
                return { status: TxStatus.PENDING, hash: null };
            }
        }
        // L2 to L1 withdraw
        try {
            const targetReceipt = await l2Provider.getTransactionReceipt(data.srcTxHash);
            const l2TxReceipt = new L2TransactionReceipt(targetReceipt);
            const [event] = l2TxReceipt.getL2ToL1Events();
            if (!event) {
                return { status: TxStatus.PENDING, hash: null };
            }

            const messageReader = new L2ToL1MessageReader(l1Provider, event);

            const status = await messageReader.status(l2Provider);
            switch (status) {
                case L2ToL1MessageStatus.CONFIRMED:
                    return { status: TxStatus.READY_TO_CLAIM, hash: null };
                case L2ToL1MessageStatus.EXECUTED:
                    return { status: TxStatus.SUCCESS, hash: null };
                case L2ToL1MessageStatus.UNCONFIRMED:
                default:
                    return { status: TxStatus.PENDING, hash: null };
            }
        } catch (error) {
            return { status: TxStatus.PENDING, hash: null };
        }
    }

    public async getScrollBridgeDstSwapStatus(data: CrossChainTradeData): Promise<TxStatusData> {
        const response = await Injector.httpClient.post<ScrollApiResponse>(
            'https://alpha-api.scroll.io/bridgehistory/api/txsbyhashes',
            {
                txs: [data.srcTxHash]
            }
        );
        const sourceTx = response!.data!.result[0]!;
        const targetHash = sourceTx?.finalizeTx?.hash;
        if (targetHash) {
            return { status: TxStatus.SUCCESS, hash: targetHash };
        }

        return { status: TxStatus.PENDING, hash: null };
    }
}
