/* eslint-disable no-debugger */
import { TransactionReceipt } from 'web3-eth';
import { BlockchainName, BlockchainsInfo } from 'src/core';
import { Injector } from 'src/core/sdk/injector';
import { celerCrossChainEventStatusesAbi } from 'src/features/cross-chain/providers/celer-trade-provider/constants/celer-cross-chain-event-statuses-abi';
import { LogsDecoder } from 'src/features/cross-chain/utils/decode-logs';
import { CROSS_CHAIN_TRADE_TYPE, CrossChainTradeType } from './models/cross-chain-trade-type';
import { celerCrossChainContractAbi } from './providers/celer-trade-provider/constants/celer-cross-chain-contract-abi';
import { celerCrossChainContractsAddresses } from './providers/celer-trade-provider/constants/celer-cross-chain-contracts-addresses';
import { CelerCrossChainSupportedBlockchain } from './providers/celer-trade-provider/constants/celer-cross-chain-supported-blockchain';
import { CelerSwapStatus } from './providers/common/celer-rubic/models/celer-swap-status.enum';
import { rubicCrossChainContractsAddresses } from './providers/rubic-trade-provider/constants/rubic-cross-chain-contracts-addresses';
import { RubicSwapStatus } from './providers/common/celer-rubic/models/rubic-swap-status.enum';
import { PROCESSED_TRANSACTION_METHOD_ABI } from './providers/common/celer-rubic/constants/processed-transactios-method-abi';
import { CrossChainStatus } from './models/cross-chain-status';
import { CrossChainTxStatus } from './models/cross-chain-tx-status';
import { LifiSwapStatus } from './providers/lifi-trade-provider/models/lifi-swap-status';
import { SymbiosisSwapStatus } from './providers/symbiosis-trade-provider/models/symbiosis-swap-status';
import { CrossChainTradeData } from './models/cross-chain-trade-data';
import { RubicCrossChainSupportedBlockchain } from './providers/rubic-trade-provider/constants/rubic-cross-chain-supported-blockchains';

interface DeBridgeApiResponse {
    claim: {
        transactionHash?: string;
    } | null;
    send: {
        isExecuted: boolean;
        confirmationsCount: number;
        transactionHash: string;
    } | null;
}

interface SymbiosisApiResponse {
    status: {
        code: string;
        text: string;
    };
    tx: {
        hash: string;
        chainId: number;
    };
}

type getDstTxStatusFn = (
    data: CrossChainTradeData,
    srcTxReceipt: TransactionReceipt
) => Promise<CrossChainTxStatus>;

/**
 * Contains methods for getting cross-chain trade statuses.
 */
export class CrossChainStatusManager {
    private readonly httpClient = Injector.httpClient;

    private readonly getDstTxStatusFnMap: Record<CrossChainTradeType, getDstTxStatusFn> = {
        [CROSS_CHAIN_TRADE_TYPE.CELER]: this.getCelerDstSwapStatus,
        [CROSS_CHAIN_TRADE_TYPE.RUBIC]: this.getRubicDstSwapStatus,
        [CROSS_CHAIN_TRADE_TYPE.LIFI]: this.getLifiDstSwapStatus,
        [CROSS_CHAIN_TRADE_TYPE.SYMBIOSIS]: this.getSymbiosisDstSwapStatus,
        [CROSS_CHAIN_TRADE_TYPE.DEBRIDGE]: this.getDebridgeDstSwapStatus
    };

    /**
     * Returns cross-chain trade statuses on the source and target network.
     * The result consists of the status of the source and target transactions.
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
        const srcTxReceipt = await this.getTxReceipt(fromBlockchain, srcTxHash as string);
        const srcTxStatus = this.getSrcTxStatus(srcTxReceipt);

        crossChainStatus.srcTxStatus = srcTxStatus;

        const dstTxStatus = await this.getDstTxStatus(
            srcTxStatus,
            srcTxReceipt as TransactionReceipt,
            data,
            provider
        );

        if (dstTxStatus === CrossChainTxStatus.FAIL && srcTxStatus === CrossChainTxStatus.PENDING) {
            crossChainStatus.srcTxStatus = CrossChainTxStatus.FAIL;
        }

        crossChainStatus.dstTxStatus = dstTxStatus;

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
     * Get destination transaction status based on source transaction status,
     * source transaction receipt, trade data and provider type.
     * @param srcTxStatus Source transaction status.
     * @param srcTxReceipt Source transaction receipt.
     * @param tradeData Trade data.
     * @param provider Cross-chain trade type.
     * @returns Cross-chain transaction status.
     */
    private async getDstTxStatus(
        srcTxStatus: CrossChainTxStatus,
        srcTxReceipt: TransactionReceipt,
        tradeData: CrossChainTradeData,
        provider: CrossChainTradeType
    ): Promise<CrossChainTxStatus> {
        if (srcTxStatus === CrossChainTxStatus.FAIL) {
            return CrossChainTxStatus.FAIL;
        }

        if (srcTxStatus === CrossChainTxStatus.PENDING) {
            return CrossChainTxStatus.PENDING;
        }

        return await this.getDstTxStatusFnMap[provider].call(this, tradeData, srcTxReceipt);
    }

    /**
     * Get Symbiosis trade dst transaction status.
     * @param data Trade data.
     * @param srcTxReceipt Source transaction receipt.
     * @returns Cross-chain transaction status.
     */
    private async getSymbiosisDstSwapStatus(
        data: CrossChainTradeData,
        srcTxReceipt: TransactionReceipt
    ): Promise<CrossChainTxStatus> {
        const symbiosisTxIndexingTimeSpent = Date.now() > data.txTimestamp + 30000;

        if (symbiosisTxIndexingTimeSpent) {
            try {
                const srcChainId = BlockchainsInfo.getBlockchainByName(data.fromBlockchain).id;
                const {
                    status: { text: dstTxStatus }
                } = await Injector.httpClient.get<SymbiosisApiResponse>(
                    `https://api.symbiosis.finance/crosschain/v1/tx/${srcChainId}/${srcTxReceipt.transactionHash}`
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
                    return CrossChainTxStatus.SUCCESS;
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
     * @param srcTxReceipt Source transaction receipt.
     * @returns Cross-chain transaction status.
     */
    private async getLifiDstSwapStatus(
        data: CrossChainTradeData,
        srcTxReceipt: TransactionReceipt
    ): Promise<CrossChainTxStatus> {
        if (!data.lifiBridgeType) {
            return CrossChainTxStatus.PENDING;
        }

        try {
            const params = {
                bridge: data.lifiBridgeType,
                fromChain: BlockchainsInfo.getBlockchainByName(data.fromBlockchain).id,
                toChain: BlockchainsInfo.getBlockchainByName(data.toBlockchain).id,
                txHash: srcTxReceipt.transactionHash
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
     * @param srcTxReceipt Source transaction receipt.
     * @returns Cross-chain transaction status.
     */
    private async getCelerDstSwapStatus(
        data: CrossChainTradeData,
        srcTxReceipt: TransactionReceipt
    ): Promise<CrossChainTxStatus> {
        try {
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
            const eightHours = 60 * 60 * 1000 * 8;
            if (!requestLog && Date.now() > data.txTimestamp + eightHours) {
                return CrossChainTxStatus.FAIL;
            }
            const dstTxStatus = Number(
                await Injector.web3PublicService
                    .getWeb3Public(data.toBlockchain)
                    .callContractMethod(
                        celerCrossChainContractsAddresses[
                            data.toBlockchain as CelerCrossChainSupportedBlockchain
                        ],
                        celerCrossChainContractAbi,
                        'processedTransactions',
                        {
                            methodArguments: [
                                requestLog?.params?.find(param => param.name === 'id')?.value
                            ]
                        }
                    )
            ) as CelerSwapStatus;

            if (dstTxStatus === CelerSwapStatus.NULL) {
                return CrossChainTxStatus.PENDING;
            }

            if (dstTxStatus === CelerSwapStatus.FAILED) {
                return CrossChainTxStatus.FAIL;
            }

            if (dstTxStatus === CelerSwapStatus.SUCСESS) {
                return CrossChainTxStatus.SUCCESS;
            }

            return CrossChainTxStatus.UNKNOWN;
        } catch (error) {
            console.debug('[Celer Trade] error retrieving tx status', error);
            return CrossChainTxStatus.PENDING;
        }
    }

    /**
     * Get Rubic trade dst transaction status.
     * @param data Trade data.
     * @param srcTxReceipt Source transaction receipt.
     * @returns Cross-chain transaction status.
     */
    private async getRubicDstSwapStatus(
        data: CrossChainTradeData,
        srcTxReceipt: TransactionReceipt
    ): Promise<CrossChainTxStatus> {
        try {
            const dstTxStatus = Number(
                await Injector.web3PublicService
                    .getWeb3Public(data.toBlockchain)
                    .callContractMethod(
                        rubicCrossChainContractsAddresses[
                            data.toBlockchain as RubicCrossChainSupportedBlockchain
                        ],
                        PROCESSED_TRANSACTION_METHOD_ABI,
                        'processedTransactions',
                        { methodArguments: [srcTxReceipt.transactionHash] }
                    )
            );

            if (dstTxStatus === RubicSwapStatus.NULL) {
                return CrossChainTxStatus.PENDING;
            }

            if (dstTxStatus === RubicSwapStatus.PROCESSED) {
                return CrossChainTxStatus.SUCCESS;
            }

            if (dstTxStatus === RubicSwapStatus.REVERTED) {
                return CrossChainTxStatus.FAIL;
            }

            return CrossChainTxStatus.UNKNOWN;
        } catch (error) {
            console.debug('[Rubic Trade] Error retrieving tx status', error);
            return CrossChainTxStatus.PENDING;
        }
    }

    /**
     * Get transaction receipt.
     * @param blockchain Blockchain name.
     * @param srcTxReceipt Transaction hash.
     * @returns Transaction receipt.
     */
    private async getTxReceipt(
        blockchain: BlockchainName,
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
     * Get DeBridge trade dst transaction status.
     * @param _data Trade data.
     * @param srcTxReceipt Source transaction receipt.
     * @returns Cross-chain transaction status.
     */
    private async getDebridgeDstSwapStatus(
        _data: CrossChainTradeData,
        srcTxReceipt: TransactionReceipt
    ): Promise<CrossChainTxStatus> {
        try {
            const params = { filter: srcTxReceipt.transactionHash, filterType: 1 };
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
}
