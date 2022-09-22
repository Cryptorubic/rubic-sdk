/* eslint-disable no-debugger */
import { Injector } from 'src/core/injector/injector';
import {
    BtcStatusResponse,
    DeBridgeApiResponse,
    GetDstTxStatusFn,
    SymbiosisApiResponse
} from 'src/features/cross-chain/cross-chain-status-manager/models/statuses-api';
import { CrossChainStatus } from 'src/features/cross-chain/cross-chain-status-manager/models/cross-chain-status';
import { CelerCrossChainSupportedBlockchain } from 'src/features/cross-chain/providers/celer-trade-provider/models/celer-cross-chain-supported-blockchain';
import { BLOCKCHAIN_NAME } from 'src/core/blockchain/models/blockchain-name';
import { StatusResponse, TransactionStatus } from 'rango-sdk-basic';
import { VIA_DEFAULT_CONFIG } from 'src/features/cross-chain/providers/via-trade-provider/constants/via-default-api-key';
import { BlockchainsInfo } from 'src/core/blockchain/utils/blockchains-info/blockchains-info';
import { RubicSdkError } from 'src/common/errors';
import { RANGO_API_KEY } from 'src/features/cross-chain/providers/rango-trade-provider/constants/rango-api-key';
import { ViaSwapStatus } from 'src/features/cross-chain/providers/via-trade-provider/models/via-swap-status';
import { SymbiosisSwapStatus } from 'src/features/cross-chain/providers/symbiosis-trade-provider/models/symbiosis-swap-status';
import { celerCrossChainEventStatusesAbi } from 'src/features/cross-chain/cross-chain-status-manager/constants/celer-cross-chain-event-statuses-abi';
import { CrossChainTxStatus } from 'src/features/cross-chain/cross-chain-status-manager/models/cross-chain-tx-status';
import { LogsDecoder } from 'src/features/cross-chain/utils/decode-logs';
import { CelerSwapStatus } from 'src/features/cross-chain/cross-chain-status-manager/models/celer-swap-status.enum';
import { CrossChainTradeData } from 'src/features/cross-chain/cross-chain-status-manager/models/cross-chain-trade-data';
import { celerCrossChainContractAbi } from 'src/features/cross-chain/providers/celer-trade-provider/constants/celer-cross-chain-contract-abi';
import {
    CROSS_CHAIN_TRADE_TYPE,
    CrossChainTradeType
} from 'src/features/cross-chain/models/cross-chain-trade-type';
import { LifiSwapStatus } from 'src/features/cross-chain/providers/lifi-trade-provider/models/lifi-swap-status';
import { Via } from '@viaprotocol/router-sdk';
import { celerCrossChainContractsAddresses } from 'src/features/cross-chain/providers/celer-trade-provider/constants/celer-cross-chain-contracts-addresses';
import { blockchainId } from 'src/core/blockchain/utils/blockchains-info/constants/blockchain-id';
import { Web3PublicSupportedBlockchain } from 'src/core/blockchain/web3-public-service/models/web3-public-storage';
import { EvmWeb3Public } from 'src/core/blockchain/web3-public-service/web3-public/evm-web3-public/evm-web3-public';
import { TronWeb3Public } from 'src/core/blockchain/web3-public-service/web3-public/tron-web3-public/tron-web3-public';

import {
    BridgersGetTransDataByIdRequest,
    BridgersGetTransDataByIdResponse
} from 'src/features/cross-chain/cross-chain-status-manager/models/bridgers-get-trans-data-by-id';
import {
    BridgersUpdateDataAndStatusRequest,
    BridgersUpdateDataAndStatusResponse
} from 'src/features/cross-chain/cross-chain-status-manager/models/bridgers-update-data-and-status';
import { toBridgersBlockchain } from 'src/features/cross-chain/providers/bridgers-trade-provider/constants/to-bridgers-blockchain';
import { BridgersCrossChainSupportedBlockchain } from 'src/features/cross-chain/providers/bridgers-trade-provider/constants/bridgers-cross-chain-supported-blockchain';

/**
 * Contains methods for getting cross-chain trade statuses.
 */
export class CrossChainStatusManager {
    private readonly httpClient = Injector.httpClient;

    private readonly getDstTxStatusFnMap: Record<CrossChainTradeType, GetDstTxStatusFn> = {
        [CROSS_CHAIN_TRADE_TYPE.CELER]: this.getCelerDstSwapStatus,
        [CROSS_CHAIN_TRADE_TYPE.LIFI]: this.getLifiDstSwapStatus,
        [CROSS_CHAIN_TRADE_TYPE.SYMBIOSIS]: this.getSymbiosisDstSwapStatus,
        [CROSS_CHAIN_TRADE_TYPE.DEBRIDGE]: this.getDebridgeDstSwapStatus,
        [CROSS_CHAIN_TRADE_TYPE.VIA]: this.getViaDstSwapStatus,
        [CROSS_CHAIN_TRADE_TYPE.RANGO]: this.getRangoDstSwapStatus,
        [CROSS_CHAIN_TRADE_TYPE.BRIDGERS]: this.getBridgersDstSwapStatus
    };

    /**
     * Returns cross-chain trade statuses on the source and target networks.
     * The result consists of statuses of the source and target transactions.
     * @example
     * ```ts
     * const tradeData = {
     *   fromBlockchain: BLOCKCHAIN_NAME.FANTOM,
     *   toBlockchain: BLOCKCHAIN_NAME.BSC,
     *   txTimestamp: 1658241570024,
     *   srxTxHash: '0xd2263ca82ac0fce606cb75df27d7f0dc94909d41a58c37563bd6772496cb8924'
     * };
     * const provider = CROSS_CHAIN_TRADE_TYPE.CELER;
     * const crossChainStatus = await sdk.crossChainStatusManager.getCrossChainStatus(tradeData, provider);
     * console.log('Source transaction status', crossChainStatus.srcTxStatus);
     * console.log('Destination transaction status', crossChainStatus.dstTxStatus);
     * ```
     * @param data Data needed to calculate statuses.
     * @param provider Cross-chain trade type.
     * @returns Object with transaction statuses.
     */
    public async getCrossChainStatus(
        data: CrossChainTradeData,
        provider: CrossChainTradeType
    ): Promise<CrossChainStatus> {
        const crossChainStatus: CrossChainStatus = {
            srcTxStatus: CrossChainTxStatus.UNKNOWN,
            dstTxStatus: CrossChainTxStatus.UNKNOWN
        };
        const { fromBlockchain, srcTxHash } = data;
        const srcTxStatus = await this.getSrcTxStatus(fromBlockchain, srcTxHash);

        crossChainStatus.srcTxStatus = srcTxStatus;

        const dstTxStatus = await this.getDstTxStatus(srcTxStatus, data, provider);

        if (dstTxStatus === CrossChainTxStatus.FAIL && srcTxStatus === CrossChainTxStatus.PENDING) {
            crossChainStatus.srcTxStatus = CrossChainTxStatus.FAIL;
        }

        crossChainStatus.dstTxStatus = dstTxStatus;

        return crossChainStatus;
    }

    /**
     * Get cross-chain trade's source transaction status via receipt.
     * @returns Cross-chain transaction status.
     */
    private async getSrcTxStatus(
        fromBlockchain: Web3PublicSupportedBlockchain,
        srcTxHash: string
    ): Promise<CrossChainTxStatus> {
        try {
            const web3Public = Injector.web3PublicService.getWeb3Public(fromBlockchain);

            if (BlockchainsInfo.isEvmBlockchainName(fromBlockchain)) {
                const srcTxReceipt = await (web3Public as EvmWeb3Public).getTransactionReceipt(
                    srcTxHash
                );

                if (srcTxReceipt === null) {
                    return CrossChainTxStatus.PENDING;
                }
                if (srcTxReceipt.status) {
                    return CrossChainTxStatus.SUCCESS;
                }
                return CrossChainTxStatus.FAIL;
            }

            // Tron
            const srcTxReceipt = await (web3Public as TronWeb3Public).getTransactionInfo(srcTxHash);

            if (srcTxReceipt?.receipt) {
                if (srcTxReceipt.result === 'FAILED') {
                    return CrossChainTxStatus.FAIL;
                }
                return CrossChainTxStatus.SUCCESS;
            }
            return CrossChainTxStatus.PENDING;
        } catch {
            return CrossChainTxStatus.PENDING;
        }
    }

    /**
     * Get destination transaction status based on source transaction status,
     * source transaction receipt, trade data and provider type.
     * @param srcTxStatus Source transaction status.
     * @param tradeData Trade data.
     * @param provider Cross-chain trade type.
     * @returns Cross-chain transaction status.
     */
    private async getDstTxStatus(
        srcTxStatus: CrossChainTxStatus,
        tradeData: CrossChainTradeData,
        provider: CrossChainTradeType
    ): Promise<CrossChainTxStatus> {
        if (srcTxStatus === CrossChainTxStatus.FAIL) {
            return CrossChainTxStatus.FAIL;
        }

        if (srcTxStatus === CrossChainTxStatus.PENDING) {
            return CrossChainTxStatus.PENDING;
        }

        return this.getDstTxStatusFnMap[provider].call(this, tradeData);
    }

    /**
     * Get Rango trade dst transaction status.
     * @param data Trade data.
     * @returns Cross-chain transaction status.
     */
    private async getRangoDstSwapStatus(data: CrossChainTradeData): Promise<CrossChainTxStatus> {
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

            if (rangoTradeStatusResponse.status === TransactionStatus.SUCCESS) {
                return CrossChainTxStatus.SUCCESS;
            }

            if (rangoTradeStatusResponse.status === TransactionStatus.FAILED) {
                const type = rangoTradeStatusResponse?.output?.type;

                if (type === 'MIDDLE_ASSET_IN_SRC' || type === 'MIDDLE_ASSET_IN_DEST') {
                    return CrossChainTxStatus.FALLBACK;
                }

                if (type === 'REVERTED_TO_INPUT') {
                    return CrossChainTxStatus.REVERT;
                }

                return CrossChainTxStatus.FAIL;
            }

            if (
                rangoTradeStatusResponse.status === TransactionStatus.RUNNING ||
                rangoTradeStatusResponse.status === null
            ) {
                return CrossChainTxStatus.PENDING;
            }

            return CrossChainTxStatus.UNKNOWN;
        } catch {
            return CrossChainTxStatus.PENDING;
        }
    }

    /**
     * Get Symbiosis trade dst transaction status.
     * @param data Trade data.
     * @returns Cross-chain transaction status.
     */
    private async getSymbiosisDstSwapStatus(
        data: CrossChainTradeData
    ): Promise<CrossChainTxStatus> {
        const symbiosisTxIndexingTimeSpent = Date.now() > data.txTimestamp + 30000;

        if (symbiosisTxIndexingTimeSpent) {
            try {
                const srcChainId = blockchainId[data.fromBlockchain];
                const {
                    status: { text: dstTxStatus },
                    tx: { hash: dstHash }
                } = await Injector.httpClient.get<SymbiosisApiResponse>(
                    `https://api.symbiosis.finance/crosschain/v1/tx/${srcChainId}/${data.srcTxHash}`
                );

                if (
                    dstTxStatus === SymbiosisSwapStatus.PENDING ||
                    dstTxStatus === SymbiosisSwapStatus.NOT_FOUND
                ) {
                    return CrossChainTxStatus.PENDING;
                }

                if (dstTxStatus === SymbiosisSwapStatus.STUCKED) {
                    return CrossChainTxStatus.REVERT;
                }

                if (dstTxStatus === SymbiosisSwapStatus.REVERTED) {
                    return CrossChainTxStatus.FALLBACK;
                }

                if (dstTxStatus === SymbiosisSwapStatus.SUCCESS) {
                    if (data.toBlockchain !== BLOCKCHAIN_NAME.BITCOIN) {
                        return CrossChainTxStatus.SUCCESS;
                    }

                    return this.getBitcoinStatus(dstHash);
                }
            } catch (error) {
                console.debug('[Symbiosis Trade] Error retrieving dst tx status', error);
                return CrossChainTxStatus.PENDING;
            }
        }

        return CrossChainTxStatus.PENDING;
    }

    /**
     * Get Li-fi trade dst transaction status.
     * @param data Trade data.
     * @returns Cross-chain transaction status.
     */
    private async getLifiDstSwapStatus(data: CrossChainTradeData): Promise<CrossChainTxStatus> {
        if (!data.lifiBridgeType) {
            return CrossChainTxStatus.PENDING;
        }

        try {
            const params = {
                bridge: data.lifiBridgeType,
                fromChain: blockchainId[data.fromBlockchain],
                toChain: blockchainId[data.toBlockchain],
                txHash: data.srcTxHash
            };
            const { status } = await Injector.httpClient.get<{ status: LifiSwapStatus }>(
                'https://li.quest/v1/status',
                { params }
            );

            if (status === LifiSwapStatus.DONE) {
                return CrossChainTxStatus.SUCCESS;
            }

            if (status === LifiSwapStatus.FAILED) {
                return CrossChainTxStatus.FAIL;
            }

            if (status === LifiSwapStatus.INVALID) {
                return CrossChainTxStatus.UNKNOWN;
            }

            if (status === LifiSwapStatus.NOT_FOUND || status === LifiSwapStatus.PENDING) {
                return CrossChainTxStatus.PENDING;
            }

            return CrossChainTxStatus.UNKNOWN;
        } catch (error) {
            console.debug('[Li-fi Trade] error retrieving tx status', error);
            return CrossChainTxStatus.PENDING;
        }
    }

    /**
     * Get Celer trade dst transaction status.
     * @param data Trade data.
     * @returns Cross-chain transaction status.
     */
    private async getCelerDstSwapStatus(data: CrossChainTradeData): Promise<CrossChainTxStatus> {
        if (!BlockchainsInfo.isEvmBlockchainName(data.toBlockchain)) {
            throw new RubicSdkError(`${data.toBlockchain} is not supported in status retrieving.`);
        }

        try {
            const web3Public = Injector.web3PublicService.getWeb3Public(data.toBlockchain);

            const srcTxReceipt = await web3Public.getTransactionReceipt(data.srcTxHash);
            // Filter undecoded logs.
            const [requestLog] = LogsDecoder.decodeLogs(
                celerCrossChainEventStatusesAbi,
                srcTxReceipt
            );
            if (!requestLog) {
                const eightHours = 60 * 60 * 1000 * 8;
                if (!requestLog && Date.now() > data.txTimestamp + eightHours) {
                    return CrossChainTxStatus.FAIL;
                }
                return CrossChainTxStatus.PENDING;
            }

            const dstTxStatus = Number(
                await web3Public.callContractMethod(
                    celerCrossChainContractsAddresses[
                        data.toBlockchain as CelerCrossChainSupportedBlockchain
                    ],
                    celerCrossChainContractAbi,
                    'processedTransactions',
                    [requestLog?.params?.find(param => param.name === 'id')?.value]
                )
            ) as CelerSwapStatus;

            if (dstTxStatus === CelerSwapStatus.NULL) {
                return CrossChainTxStatus.PENDING;
            }

            if (dstTxStatus === CelerSwapStatus.FAILED) {
                return CrossChainTxStatus.FAIL;
            }

            if (dstTxStatus === CelerSwapStatus.SUCCESS) {
                return CrossChainTxStatus.SUCCESS;
            }

            return CrossChainTxStatus.UNKNOWN;
        } catch (error) {
            console.debug('[Celer Trade] error retrieving tx status', error);
            return CrossChainTxStatus.PENDING;
        }
    }

    /**
     * Get DeBridge trade dst transaction status.
     * @param data Trade data.
     * @returns Cross-chain transaction status.
     */
    private async getDebridgeDstSwapStatus(data: CrossChainTradeData): Promise<CrossChainTxStatus> {
        try {
            const params = { filter: data.srcTxHash, filterType: 1 };
            const { send = null, claim = null } = await this.httpClient.get<DeBridgeApiResponse>(
                'https://api.debridge.finance/api/Transactions/GetFullSubmissionInfo',
                { params }
            );

            if (!send || !claim) {
                return CrossChainTxStatus.PENDING;
            }

            if (claim?.transactionHash) {
                return CrossChainTxStatus.SUCCESS;
            }

            return CrossChainTxStatus.FAIL;
        } catch {
            return CrossChainTxStatus.PENDING;
        }
    }

    /**
     * Get Via trade dst transaction status.
     * @param data Trade data.
     * @returns Cross-chain transaction status.
     */
    private async getViaDstSwapStatus(data: CrossChainTradeData): Promise<CrossChainTxStatus> {
        try {
            const txStatusResponse = await new Via(VIA_DEFAULT_CONFIG).checkTx({
                actionUuid: data.viaUuid!
            });
            const status = txStatusResponse.event as unknown as ViaSwapStatus;

            if (status === ViaSwapStatus.SUCCESS) {
                return CrossChainTxStatus.SUCCESS;
            }
            if (status === ViaSwapStatus.FAIL) {
                return CrossChainTxStatus.FAIL;
            }
            return CrossChainTxStatus.PENDING;
        } catch {
            return CrossChainTxStatus.PENDING;
        }
    }

    /**
     * Get Bridgers trade dst transaction status.
     * @param data Trade data.
     * @returns Cross-chain transaction status.
     */
    private async getBridgersDstSwapStatus(data: CrossChainTradeData): Promise<CrossChainTxStatus> {
        try {
            const updateDataAndStatusRequest: BridgersUpdateDataAndStatusRequest = {
                hash: data.srcTxHash,
                fromTokenChain:
                    toBridgersBlockchain[
                        data.fromBlockchain as BridgersCrossChainSupportedBlockchain
                    ],
                sourceFlag: 'rubic'
            };
            const updateDataAndStatusResponse =
                await Injector.httpClient.post<BridgersUpdateDataAndStatusResponse>(
                    'https://sswap.swft.pro/api/exchangeRecord/updateDataAndStatus',
                    updateDataAndStatusRequest
                );
            const orderId = updateDataAndStatusResponse.data?.orderId;
            if (!orderId) {
                return CrossChainTxStatus.PENDING;
            }

            const getTransDataByIdRequest: BridgersGetTransDataByIdRequest = {
                orderId
            };
            const getTransDataByIdResponse =
                await this.httpClient.post<BridgersGetTransDataByIdResponse>(
                    'https://sswap.swft.pro/api/exchangeRecord/getTransDataById',
                    getTransDataByIdRequest
                );
            const transactionData = getTransDataByIdResponse.data;
            if (!transactionData?.status) {
                return CrossChainTxStatus.PENDING;
            }

            if (transactionData.status === 'receive_complete') {
                return CrossChainTxStatus.SUCCESS;
            }
            if (
                transactionData.status.includes('error') ||
                transactionData.status.includes('fail')
            ) {
                return CrossChainTxStatus.FAIL;
            }
            return CrossChainTxStatus.PENDING;
        } catch {
            return CrossChainTxStatus.PENDING;
        }
    }

    /**
     * @internal
     * Get transaction status in bitcoin network;
     * @param hash Bitcoin transaction hash.
     */
    private async getBitcoinStatus(hash: string): Promise<CrossChainTxStatus> {
        let bitcoinTransactionStatus: BtcStatusResponse;
        try {
            const btcStatusApi = 'https://blockchain.info/rawtx/';
            bitcoinTransactionStatus = await this.httpClient.get<BtcStatusResponse>(
                `${btcStatusApi}${hash}`
            );
        } catch {
            return CrossChainTxStatus.PENDING;
        }

        const isCompleted = bitcoinTransactionStatus?.block_index !== undefined;
        if (isCompleted) {
            return CrossChainTxStatus.SUCCESS;
        }
        return CrossChainTxStatus.PENDING;
    }
}
