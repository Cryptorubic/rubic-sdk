import {
    L1ToL2MessageStatus,
    L1TransactionReceipt,
    L2ToL1MessageReader,
    L2ToL1MessageStatus,
    L2TransactionReceipt
} from '@arbitrum/sdk';
import { JsonRpcProvider } from '@ethersproject/providers';
import { RubicSdkError } from 'src/common/errors';
import {
    BLOCKCHAIN_NAME,
    TEST_EVM_BLOCKCHAIN_NAME
} from 'src/core/blockchain/models/blockchain-name';
import { BlockchainsInfo } from 'src/core/blockchain/utils/blockchains-info/blockchains-info';
import { blockchainId } from 'src/core/blockchain/utils/blockchains-info/constants/blockchain-id';
import {
    TX_STATUS,
    TxStatus
} from 'src/core/blockchain/web3-public-service/web3-public/models/tx-status';
import { Injector } from 'src/core/injector/injector';
import { DlnApiService } from 'src/features/common/providers/dln/dln-api-service';
import { RANGO_SWAP_STATUS } from 'src/features/common/providers/rango/models/rango-api-status-types';
import { RangoCommonParser } from 'src/features/common/providers/rango/services/rango-parser';
import { XY_API_ENDPOINT } from 'src/features/common/providers/xy/constants/xy-api-params';
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
    TRANSFER_HISTORY_STATUS,
    TRANSFER_HISTORY_STATUS_CODE,
    XFER_STATUS,
    XFER_STATUS_CODE
} from 'src/features/cross-chain/calculation-manager/providers/cbridge/models/cbridge-status-response';
import {
    LIFI_SWAP_STATUS,
    LifiSwapStatus
} from 'src/features/cross-chain/calculation-manager/providers/lifi-provider/models/lifi-swap-status';
import { SquidrouterCrossChainProvider } from 'src/features/cross-chain/calculation-manager/providers/squidrouter-provider/squidrouter-cross-chain-provider';
import { SYMBIOSIS_SWAP_STATUS } from 'src/features/cross-chain/calculation-manager/providers/symbiosis-provider/models/symbiosis-swap-status';
import { CrossChainCbridgeManager } from 'src/features/cross-chain/cbridge-manager/cross-chain-cbridge-manager';
import { MULTICHAIN_STATUS_MAPPING } from 'src/features/cross-chain/status-manager/constants/multichain-status-mapping';
import { CHANGENOW_API_STATUS } from 'src/features/cross-chain/status-manager/models/changenow-api-response';
import { CrossChainStatus } from 'src/features/cross-chain/status-manager/models/cross-chain-status';
import { CrossChainTradeData } from 'src/features/cross-chain/status-manager/models/cross-chain-trade-data';
import { MultichainStatusApiResponse } from 'src/features/cross-chain/status-manager/models/multichain-status-api-response';
import { RubicBackendPsStatus } from 'src/features/cross-chain/status-manager/models/rubic-backend-ps-status';
import { ScrollApiResponse } from 'src/features/cross-chain/status-manager/models/scroll-api-response';
import { SquidrouterApiResponse } from 'src/features/cross-chain/status-manager/models/squidrouter-api-response';
import { SQUIDROUTER_TRANSFER_STATUS } from 'src/features/cross-chain/status-manager/models/squidrouter-transfer-status.enum';
import {
    BtcStatusResponse,
    DE_BRIDGE_API_STATE_STATUS,
    GetDstTxDataFn,
    SymbiosisApiResponse
} from 'src/features/cross-chain/status-manager/models/statuses-api';
import { XyApiResponse } from 'src/features/cross-chain/status-manager/models/xy-api-response';

import { ChangeNowCrossChainApiService } from '../calculation-manager/providers/changenow-provider/services/changenow-cross-chain-api-service';
import { MesonCcrApiService } from '../calculation-manager/providers/meson-provider/services/meson-cross-chain-api-service';
import { OrbiterApiService } from '../calculation-manager/providers/orbiter-bridge/services/orbiter-api-service';
import { OwlToApiService } from '../calculation-manager/providers/owl-to-bridge/services/owl-to-api-service';
import { RangoCrossChainApiService } from '../calculation-manager/providers/rango-provider/services/rango-cross-chain-api-service';
import { TAIKO_API_STATUS, TaikoApiResponse } from './models/taiko-api-response';

/**
 * Contains methods for getting cross-chain trade statuses.
 */
export class CrossChainStatusManager {
    private readonly httpClient = Injector.httpClient;

    private readonly getDstTxStatusFnMap: Record<CrossChainTradeType, GetDstTxDataFn | null> = {
        [CROSS_CHAIN_TRADE_TYPE.LIFI]: this.getLifiDstSwapStatus,
        [CROSS_CHAIN_TRADE_TYPE.SYMBIOSIS]: this.getSymbiosisDstSwapStatus,
        [CROSS_CHAIN_TRADE_TYPE.DEBRIDGE]: this.getDebridgeDstSwapStatus,
        [CROSS_CHAIN_TRADE_TYPE.BRIDGERS]: this.getBridgersDstSwapStatus,
        [CROSS_CHAIN_TRADE_TYPE.MULTICHAIN]: this.getMultichainDstSwapStatus,
        [CROSS_CHAIN_TRADE_TYPE.XY]: this.getXyDstSwapStatus,
        [CROSS_CHAIN_TRADE_TYPE.CELER_BRIDGE]: this.getCelerBridgeDstSwapStatus,
        [CROSS_CHAIN_TRADE_TYPE.CHANGENOW]: this.getChangenowDstSwapStatus,
        [CROSS_CHAIN_TRADE_TYPE.STARGATE]: this.getLayerZeroDstSwapStatus,
        [CROSS_CHAIN_TRADE_TYPE.ARBITRUM]: this.getArbitrumBridgeDstSwapStatus,
        [CROSS_CHAIN_TRADE_TYPE.SQUIDROUTER]: this.getSquidrouterDstSwapStatus,
        [CROSS_CHAIN_TRADE_TYPE.SCROLL_BRIDGE]: this.getScrollBridgeDstSwapStatus,
        [CROSS_CHAIN_TRADE_TYPE.TAIKO_BRIDGE]: this.getTaikoBridgeDstSwapStatus,
        [CROSS_CHAIN_TRADE_TYPE.RANGO]: this.getRangoDstSwapStatus,
        [CROSS_CHAIN_TRADE_TYPE.PULSE_CHAIN_BRIDGE]: this.getPulseChainDstSwapStatus,
        [CROSS_CHAIN_TRADE_TYPE.ORBITER_BRIDGE]: this.getOrbiterDstSwapStatus,
        [CROSS_CHAIN_TRADE_TYPE.LAYERZERO]: this.getLayerZeroDstSwapStatus,
        [CROSS_CHAIN_TRADE_TYPE.ARCHON_BRIDGE]: this.getLayerZeroDstSwapStatus,
        [CROSS_CHAIN_TRADE_TYPE.MESON]: this.getMesonDstSwapStatus,
        [CROSS_CHAIN_TRADE_TYPE.OWL_TO_BRIDGE]: this.getOwlToDstSwapStatus
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
        if (dstTxData.status === TX_STATUS.FAIL && srcTxStatus === TX_STATUS.PENDING) {
            srcTxStatus = TX_STATUS.FAIL;
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
        if (srcTxStatus === TX_STATUS.FAIL) {
            return { hash: null, status: TX_STATUS.FAIL };
        }

        if (srcTxStatus === TX_STATUS.PENDING) {
            return { hash: null, status: TX_STATUS.PENDING };
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
    private async getLayerZeroDstSwapStatus(data: CrossChainTradeData): Promise<TxStatusData> {
        const lzPackage = await import('@layerzerolabs/scan-client');
        const client = lzPackage.createClient('mainnet');
        const scanResponse = await client.getMessagesBySrcTxHash(data.srcTxHash);
        const targetTrade = scanResponse.messages.find(
            item => item.srcTxHash.toLocaleLowerCase() === data.srcTxHash.toLocaleLowerCase()
        );
        const txStatusData: TxStatusData = {
            status: TX_STATUS.PENDING,
            hash: null
        };

        if (targetTrade?.dstTxHash) {
            txStatusData.hash = targetTrade.dstTxHash;
        }

        if (targetTrade?.status === 'DELIVERED') {
            txStatusData.status = TX_STATUS.SUCCESS;
        }

        if (targetTrade?.status === 'INFLIGHT') {
            txStatusData.status = TX_STATUS.PENDING;
        }

        if (targetTrade?.status === 'FAILED') {
            txStatusData.status = TX_STATUS.FAIL;
        }

        return txStatusData;
    }

    /**
     * Get Symbiosis trade dst transaction status and hash.
     * @param data Trade data.
     * @returns Cross-chain transaction status and hash.
     */
    private async getSymbiosisDstSwapStatus(data: CrossChainTradeData): Promise<TxStatusData> {
        const symbiosisTxIndexingTimeSpent = Date.now() > data.txTimestamp + 30000;
        const symbiosisApi = Object.keys(TEST_EVM_BLOCKCHAIN_NAME).includes(data.fromBlockchain)
            ? 'api.testnet'
            : 'api-v2';

        if (symbiosisTxIndexingTimeSpent) {
            try {
                const srcChainId = blockchainId[data.fromBlockchain];
                const toBlockchainId = blockchainId[data.toBlockchain];
                const {
                    status: { text: dstTxStatus },
                    tx,
                    transitTokenSent
                } = await Injector.httpClient.get<SymbiosisApiResponse>(
                    `https://${symbiosisApi}.symbiosis.finance/crosschain/v1/tx/${srcChainId}/${data.srcTxHash}`
                );

                let dstTxData: TxStatusData = {
                    status: TX_STATUS.PENDING,
                    hash: tx?.hash || null
                };

                const targetTokenNetwork = tx?.chainId;

                if (
                    dstTxStatus === SYMBIOSIS_SWAP_STATUS.PENDING ||
                    dstTxStatus === SYMBIOSIS_SWAP_STATUS.NOT_FOUND
                ) {
                    return { ...dstTxData, status: TX_STATUS.PENDING };
                }

                if (dstTxStatus === SYMBIOSIS_SWAP_STATUS.STUCKED) {
                    return { ...dstTxData, status: TX_STATUS.REVERT };
                }

                if (dstTxStatus === SYMBIOSIS_SWAP_STATUS.REVERTED || transitTokenSent) {
                    return { ...dstTxData, status: TX_STATUS.FALLBACK };
                }

                if (
                    dstTxStatus === SYMBIOSIS_SWAP_STATUS.SUCCESS &&
                    targetTokenNetwork === toBlockchainId
                ) {
                    if (data.toBlockchain !== BLOCKCHAIN_NAME.BITCOIN) {
                        dstTxData.status = TX_STATUS.SUCCESS;
                    } else {
                        dstTxData = await this.getBitcoinStatus(tx!.hash);
                    }
                }

                return dstTxData;
            } catch (error) {
                console.debug('[Symbiosis Trade] Error retrieving dst tx status', error);
                return {
                    status: TX_STATUS.PENDING,
                    hash: null
                };
            }
        }

        return {
            status: TX_STATUS.PENDING,
            hash: null
        };
    }

    /**
     * Get Li-fi trade dst transaction status and hash.
     * @param data Trade data.
     * @returns Cross-chain transaction status and hash.
     */
    private async getLifiDstSwapStatus(data: CrossChainTradeData): Promise<TxStatusData> {
        try {
            const params = {
                ...(data.lifiBridgeType && { bridge: data.lifiBridgeType }),
                fromChain: blockchainId[data.fromBlockchain],
                toChain: blockchainId[data.toBlockchain],
                txHash: data.srcTxHash
            };
            const { status, receiving } = await Injector.httpClient.get<{
                status: LifiSwapStatus;
                receiving: { txHash: string };
            }>('https://li.quest/v1/status', { params });
            const dstTxData: TxStatusData = {
                status: TX_STATUS.UNKNOWN,
                hash: receiving?.txHash || null
            };

            if (status === LIFI_SWAP_STATUS.DONE) {
                dstTxData.status = TX_STATUS.SUCCESS;
            }

            if (status === LIFI_SWAP_STATUS.FAILED) {
                dstTxData.status = TX_STATUS.FAIL;
            }

            if (status === LIFI_SWAP_STATUS.INVALID) {
                dstTxData.status = TX_STATUS.UNKNOWN;
            }

            if (status === LIFI_SWAP_STATUS.NOT_FOUND || status === LIFI_SWAP_STATUS.PENDING) {
                dstTxData.status = TX_STATUS.PENDING;
            }

            return dstTxData;
        } catch (error) {
            console.debug('[Li-fi Trade] error retrieving tx status', error);
            return {
                status: TX_STATUS.PENDING,
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
            const { orderIds } = await DlnApiService.fetchCrossChainOrdersByHash(data.srcTxHash);

            if (!orderIds.length) {
                return {
                    status: TX_STATUS.PENDING,
                    hash: null
                };
            }

            const orderId = orderIds[0];
            const dstTxData: TxStatusData = {
                status: TX_STATUS.PENDING,
                hash: null
            };

            const { status } = await DlnApiService.fetchCrossChainStatus(orderId);

            if (
                status === DE_BRIDGE_API_STATE_STATUS.FULFILLED ||
                status === DE_BRIDGE_API_STATE_STATUS.SENTUNLOCK ||
                status === DE_BRIDGE_API_STATE_STATUS.CLAIMEDUNLOCK
            ) {
                const { fulfilledDstEventMetadata } =
                    await DlnApiService.fetchCrossChainEventMetaData(orderId);

                dstTxData.hash = fulfilledDstEventMetadata.transactionHash.stringValue;
                dstTxData.status = TX_STATUS.SUCCESS;
            } else if (
                status === DE_BRIDGE_API_STATE_STATUS.ORDERCANCELLED ||
                status === DE_BRIDGE_API_STATE_STATUS.SENTORDERCANCEL ||
                status === DE_BRIDGE_API_STATE_STATUS.CLAIMEDORDERCANCEL
            ) {
                dstTxData.status = TX_STATUS.FAIL;
            }

            return dstTxData;
        } catch {
            return {
                status: TX_STATUS.PENDING,
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
        return getBridgersTradeStatus(
            data.srcTxHash,
            data.fromBlockchain as BridgersCrossChainSupportedBlockchain,
            'rubic'
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
            status: TX_STATUS.PENDING,
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
                status: TX_STATUS.PENDING,
                hash: null
            };
        }

        const isCompleted = bitcoinTransactionStatus?.block_index !== undefined;
        if (isCompleted) {
            dstTxData.status = TX_STATUS.SUCCESS;
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
                status: MULTICHAIN_STATUS_MAPPING?.[status] || TX_STATUS.PENDING,
                hash: swaptx || null
            };
        } catch {
            return {
                status: TX_STATUS.PENDING,
                hash: null
            };
        }
    }

    private async getXyDstSwapStatus(data: CrossChainTradeData): Promise<TxStatusData> {
        try {
            const { success, tx } = await this.httpClient.get<XyApiResponse>(
                `${XY_API_ENDPOINT}/crossChainStatus?srcChainId=${
                    blockchainId[data.fromBlockchain]
                }&srcTxHash=${data.srcTxHash}`
            );

            if (success && tx) {
                return { status: TX_STATUS.SUCCESS, hash: tx };
            }
            return { status: TX_STATUS.PENDING, hash: null };
        } catch {
            return { status: TX_STATUS.PENDING, hash: null };
        }
    }

    private async getCelerBridgeDstSwapStatus(data: CrossChainTradeData): Promise<TxStatusData> {
        try {
            const transferId = await CrossChainCbridgeManager.getTransferId(
                data.srcTxHash,
                data.fromBlockchain as CbridgeCrossChainSupportedBlockchain
            );
            const useTestnet = BlockchainsInfo.isTestBlockchainName(data.fromBlockchain);
            const swapData = await CbridgeCrossChainApiService.fetchTradeStatus(transferId, {
                useTestnet
            });

            const transformedStatus = TRANSFER_HISTORY_STATUS_CODE[swapData.status as number];

            switch (transformedStatus) {
                case TRANSFER_HISTORY_STATUS.TRANSFER_UNKNOWN:
                case TRANSFER_HISTORY_STATUS.TRANSFER_SUBMITTING:
                case TRANSFER_HISTORY_STATUS.TRANSFER_WAITING_FOR_SGN_CONFIRMATION:
                case TRANSFER_HISTORY_STATUS.TRANSFER_REQUESTING_REFUND:
                case TRANSFER_HISTORY_STATUS.TRANSFER_CONFIRMING_YOUR_REFUND:
                default:
                    return { status: TX_STATUS.PENDING, hash: null };
                case TRANSFER_HISTORY_STATUS.TRANSFER_REFUNDED:
                case TRANSFER_HISTORY_STATUS.TRANSFER_COMPLETED:
                    return {
                        status: TX_STATUS.SUCCESS,
                        hash: swapData.dst_block_tx_link.split('/').at(-1)!
                    };
                case TRANSFER_HISTORY_STATUS.TRANSFER_FAILED:
                    return {
                        status: TX_STATUS.FAIL,
                        hash: null
                    };
                case TRANSFER_HISTORY_STATUS.TRANSFER_WAITING_FOR_FUND_RELEASE:
                case TRANSFER_HISTORY_STATUS.TRANSFER_TO_BE_REFUNDED:
                    return XFER_STATUS_CODE[swapData.refund_reason] === XFER_STATUS.OK_TO_RELAY
                        ? {
                              status: TX_STATUS.PENDING,
                              hash: null
                          }
                        : {
                              status: TX_STATUS.REVERT,
                              hash: null
                          };
            }
        } catch {
            return { status: TX_STATUS.PENDING, hash: null };
        }
    }

    private async getChangenowDstSwapStatus(data: CrossChainTradeData): Promise<TxStatusData> {
        if (!data.changenowId) {
            throw new RubicSdkError('Must provide changenow trade id');
        }
        try {
            const { status, payoutHash } = await ChangeNowCrossChainApiService.getTxStatus(
                data.changenowId
            );

            if (
                status === CHANGENOW_API_STATUS.FINISHED ||
                status === CHANGENOW_API_STATUS.REFUNDED
            ) {
                return { status: TX_STATUS.SUCCESS, hash: payoutHash };
            }
            if (status === CHANGENOW_API_STATUS.FAILED) {
                return { status: TX_STATUS.FAIL, hash: null };
            }
            return { status: TX_STATUS.PENDING, hash: null };
        } catch {
            return { status: TX_STATUS.PENDING, hash: null };
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
                        return { status: TX_STATUS.REVERT, hash: null };
                    case L1ToL2MessageStatus.EXPIRED:
                    case L1ToL2MessageStatus.CREATION_FAILED:
                        return { status: TX_STATUS.FAIL, hash: null };
                    case L1ToL2MessageStatus.REDEEMED:
                        return {
                            status: TX_STATUS.SUCCESS,
                            hash: response.l2TxReceipt.transactionHash
                        };
                    case L1ToL2MessageStatus.NOT_YET_CREATED:
                    default:
                        return { status: TX_STATUS.PENDING, hash: null };
                }
            } catch {
                return { status: TX_STATUS.PENDING, hash: null };
            }
        }
        // L2 to L1 withdraw
        try {
            const targetReceipt = await l2Provider.getTransactionReceipt(data.srcTxHash);
            const l2TxReceipt = new L2TransactionReceipt(targetReceipt);
            const [event] = l2TxReceipt.getL2ToL1Events();
            if (!event) {
                return { status: TX_STATUS.PENDING, hash: null };
            }

            const messageReader = new L2ToL1MessageReader(l1Provider, event);

            const status = await messageReader.status(l2Provider);
            switch (status) {
                case L2ToL1MessageStatus.CONFIRMED:
                    return { status: TX_STATUS.READY_TO_CLAIM, hash: null };
                case L2ToL1MessageStatus.EXECUTED:
                    return { status: TX_STATUS.SUCCESS, hash: null };
                case L2ToL1MessageStatus.UNCONFIRMED:
                default:
                    return { status: TX_STATUS.PENDING, hash: null };
            }
        } catch (error) {
            return { status: TX_STATUS.PENDING, hash: null };
        }
    }

    private async getSquidrouterDstSwapStatus(data: CrossChainTradeData): Promise<TxStatusData> {
        try {
            const { status, toChain } = await this.httpClient.get<SquidrouterApiResponse>(
                `${SquidrouterCrossChainProvider.apiEndpoint}status?transactionId=${data.srcTxHash}`,
                { headers: { 'x-integrator-id': 'rubic-api' } }
            );

            if (
                status === SQUIDROUTER_TRANSFER_STATUS.DEST_EXECUTED ||
                status === SQUIDROUTER_TRANSFER_STATUS.EXPRESS_EXECUTED
            ) {
                return { status: TX_STATUS.SUCCESS, hash: toChain!.transactionId! };
            }

            if (status === SQUIDROUTER_TRANSFER_STATUS.DEST_ERROR) {
                return { status: TX_STATUS.FAIL, hash: null };
            }

            return { status: TX_STATUS.PENDING, hash: null };
        } catch {
            return { status: TX_STATUS.PENDING, hash: null };
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
            return { status: TX_STATUS.SUCCESS, hash: targetHash };
        }

        return { status: TX_STATUS.PENDING, hash: null };
    }

    public async getTaikoBridgeDstSwapStatus(data: CrossChainTradeData): Promise<TxStatusData> {
        if (!data.taikoTransactionId) {
            throw new RubicSdkError('Must provide Taiko transaction ID');
        }
        if (!data.sender) {
            throw new RubicSdkError('Must specify sender account');
        }
        const { items } = await Injector.httpClient.get<TaikoApiResponse>(
            `https://relayer.katla.taiko.xyz/events?address=${data.sender}&msgHash=${data.taikoTransactionId}&event=MessageSent`
        );

        if (!items[0]) {
            throw new RubicSdkError('Taiko Relayer did not find transaction with such ID');
        }

        const { status, data: taikoData } = items[0];

        if (status === TAIKO_API_STATUS.DONE) {
            return { status: TX_STATUS.SUCCESS, hash: taikoData.Raw.transactionHash };
        }

        return { status: TX_STATUS.PENDING, hash: null };
    }

    public async getPulseChainDstSwapStatus(data: CrossChainTradeData): Promise<TxStatusData> {
        try {
            const network =
                data.fromBlockchain === BLOCKCHAIN_NAME.ETHEREUM ? 'ethereum' : 'ethereum';
            const result = await Injector.httpClient.get<RubicBackendPsStatus>(
                `https://api.rubic.exchange/api/v2/trades/crosschain/pulsechain_bridge_status?tx_hash=${data.srcTxHash}&network=${network}`
            );

            if (result.status === 'SUCCESS') {
                return { status: TX_STATUS.SUCCESS, hash: result.dest_transaction };
            }
            return { status: TX_STATUS.PENDING, hash: null };
        } catch {
            return { status: TX_STATUS.PENDING, hash: null };
        }
    }

    private async getRangoDstSwapStatus(data: CrossChainTradeData): Promise<TxStatusData> {
        if (!data.rangoRequestId) {
            throw new RubicSdkError('Must provide rangoRequestId');
        }
        const { srcTxHash, rangoRequestId } = data;
        const params = RangoCommonParser.getTxStatusQueryParams(srcTxHash, rangoRequestId!);

        const { bridgeData, status: txStatus } = await RangoCrossChainApiService.getTxStatus(
            params
        );

        let status: TxStatus;

        if (txStatus === RANGO_SWAP_STATUS.SUCCESS) {
            status = TX_STATUS.SUCCESS;
        } else if (txStatus === RANGO_SWAP_STATUS.RUNNING) {
            status = TX_STATUS.PENDING;
        } else {
            status = TX_STATUS.FAIL;
        }

        const hash = bridgeData!.destTxHash;

        return { hash, status };
    }

    private async getOrbiterDstSwapStatus(data: CrossChainTradeData): Promise<TxStatusData> {
        const txStatusData = await OrbiterApiService.getTxStatus(data.srcTxHash);

        return txStatusData;
    }

    private async getMesonDstSwapStatus(data: CrossChainTradeData): Promise<TxStatusData> {
        return MesonCcrApiService.fetchTxStatus(data.srcTxHash);
    }

    // @TODO implement getOwlToDstSwapStatus
    private async getOwlToDstSwapStatus(data: CrossChainTradeData): Promise<TxStatusData> {
        const txStatusData = await OwlToApiService.getTxStatus(data.fromBlockchain, data.srcTxHash);

        return txStatusData;
    }
}
