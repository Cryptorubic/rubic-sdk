import { TransactionReceipt } from 'web3-eth';
import { BlockchainName, BlockchainsInfo } from 'src/core';
import { Injector } from 'src/core/sdk/injector';
import { CrossChainTradeType, CROSS_CHAIN_TRADE_TYPE } from './models/cross-chain-trade-type';
import { decodeLogs } from './utils/decode-logs';
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
        [CROSS_CHAIN_TRADE_TYPE.SYMBIOSIS]: this.getSymbiosisDstSwapStatus
    };

    /**
     * Returns cross-chain trade statuses on the source and target network.
     * the result consists of the status of the source and target transactions.
     * @example
     * ```ts
     * const tradeData = {
     *   fromBlockchain: BLOCKCHAIN_NAME.BSC,
     *   toBlockchain: BLOCKCHAIN_NAME.POLYGON,
     *   txTimestamp: 1658288356485,
     *   srxTxHash: '1111'
     * };
     * const provider = CROSS_CHAIN_TRADE_TYPE.CELER;
     * const crossChainStatus = await sdk.crossChainStatusManager.getCrossChainStatus(tradeData, provider);
     * console.log('Source transaction status', crossChainStatus.srcTxStatus);
     * console.log('Destination transaction status', crossChainStatus.dstTxStatus);
     *```
     * @param data Data needed to calculate statuses.
     * @param provider Cross-chain provider.
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

        crossChainStatus.dstTxStatus = dstTxStatus;

        return crossChainStatus;
    }

    /**
     * Get cross-chain trade's source transaction status via receipt.
     * @example
     * ```ts
     * const tradeData = {
     *   fromBlockchain: BLOCKCHAIN_NAME.BSC,
     *   toBlockchain: BLOCKCHAIN_NAME.POLYGON,
     *   txTimestamp: 1658288356485,
     *   srxTxHash: '1111'
     * };
     * const srcTxReceipt = await Injector.web3PublicService
     *    .getWeb3Public(tradeData.fromBlockchain)
     *    .getTransactionReceipt(tradeData.srcTxHash);
     * const sourceTransactionStatus = sdk.crossChainStatusManager.getSrcTxStatus(srcTxReceipt);
     * console.log({ sourceTransactionStatus });
     * ```
     * @param srcTxReceipt Transaction receipt
     * @returns Cross-chain transaction status
     */
    public getSrcTxStatus(srcTxReceipt: TransactionReceipt | null): CrossChainTxStatus {
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
     * @example
     * ```ts
     * const tradeData = {
     *   fromBlockchain: BLOCKCHAIN_NAME.BSC,
     *   toBlockchain: BLOCKCHAIN_NAME.POLYGON,
     *   txTimestamp: 1658288356485,
     *   srxTxHash: '1111'
     * };
     * const provider = CROSS_CHAIN_TRADE_TYPE.CELER;
     * const srcTxReceipt = await Injector.web3PublicService
     *    .getWeb3Public(tradeData.fromBlockchain)
     *    .getTransactionReceipt(tradeData.srcTxHash);
     * const srcTxStatus = sdk.crossChainStatusManager.getSrcTxStatus(srcTxReceipt);
     *
     * const destinationTransactionStatus = await sdk.crossChainStatusManager.getDstTxStatus(
     *    srcTxStatus,
     *    srcTxReceipt,
     *    tradeData,
     *    provider
     * );
     * console.log({ destinationTransactionStatus });
     * ```
     * @param srcTxStatus
     * @param srcTxReceipt
     * @param tradeData
     * @param provider
     * @returns
     */
    public async getDstTxStatus(
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

        return await this.getDstTxStatusFnMap[provider](tradeData, srcTxReceipt);
    }

    /**
     * Get Symbiosis trade dst transaction status.
     * @param data Trade data.
     * @param srcTxReceipt Src transaction receipt.
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
                } = await this.httpClient.get<SymbiosisApiResponse>(
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
     * @param srcTxReceipt Src transaction receipt.
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
            const { status } = await this.httpClient.get<{ status: LifiSwapStatus }>(
                'https://li.quest/v1/',
                { params }
            );

            if (status === LifiSwapStatus.DONE) {
                return CrossChainTxStatus.SUCCESS;
            }

            if (status === LifiSwapStatus.FAILED) {
                return CrossChainTxStatus.FAIL;
            }

            if (
                status === LifiSwapStatus.INVALID ||
                status === LifiSwapStatus.NOT_FOUND ||
                status === LifiSwapStatus.PENDING
            ) {
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
     * @param srcTxReceipt Src transaction receipt.
     * @returns Cross-chain transaction status.
     */
    private async getCelerDstSwapStatus(
        data: CrossChainTradeData,
        srcTxReceipt: TransactionReceipt
    ): Promise<CrossChainTxStatus> {
        try {
            const [requestLog] = decodeLogs(celerCrossChainContractAbi, srcTxReceipt).filter(
                Boolean
            ); // filter undecoded logs
            const dstTxStatus = Number(
                await Injector.web3PublicService
                    .getWeb3Public(data.toBlockchain)
                    .callContractMethod(
                        celerCrossChainContractsAddresses[
                            data.toBlockchain as CelerCrossChainSupportedBlockchain
                        ],
                        celerCrossChainContractAbi,
                        'txStatusById',
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
     * @param srcTxReceipt Src transaction receipt.
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
}
