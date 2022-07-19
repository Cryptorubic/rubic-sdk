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

type setupDstTxStatusFn = (
    data: CrossChainTradeData,
    srcTxReceipt: TransactionReceipt
) => Promise<CrossChainTxStatus>;

export class CrossChainStatusManager {
    private readonly httpClient = Injector.httpClient;

    private readonly setupDstTxStatusFn: Record<CrossChainTradeType, setupDstTxStatusFn> = {
        [CROSS_CHAIN_TRADE_TYPE.CELER]: this.getCelerDstSwapStatus,
        [CROSS_CHAIN_TRADE_TYPE.RUBIC]: this.getRubicDstSwapStatus,
        [CROSS_CHAIN_TRADE_TYPE.LIFI]: this.getLifiDstSwapStatus,
        [CROSS_CHAIN_TRADE_TYPE.SYMBIOSIS]: this.getSymbiosisDstSwapStatus
    };

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

    public getSrcTxStatus(srcTxReceipt: TransactionReceipt | null): CrossChainTxStatus {
        if (srcTxReceipt === null) {
            return CrossChainTxStatus.PENDING;
        }

        if (srcTxReceipt.status) {
            return CrossChainTxStatus.SUCCESS;
        }

        return CrossChainTxStatus.FAIL;
    }

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

        return await this.setupDstTxStatusFn[provider](tradeData, srcTxReceipt);
    }

    private async getSymbiosisDstSwapStatus(
        data: CrossChainTradeData,
        srcTxReceipt: TransactionReceipt
    ): Promise<CrossChainTxStatus> {
        const txIndexingTimeSpent = Date.now() > data.txTimestamp + 30000;

        if (txIndexingTimeSpent) {
            try {
                const srcChainId = BlockchainsInfo.getBlockchainByName(data.fromBlockchain).id;
                const response = await this.httpClient.get<SymbiosisApiResponse>(
                    `https://api.symbiosis.finance/crosschain/v1/tx/${srcChainId}/${srcTxReceipt.transactionHash}`
                );
                const status = response.status.text;

                if (
                    status === SymbiosisSwapStatus.PENDING ||
                    status === SymbiosisSwapStatus.NOT_FOUND
                ) {
                    return CrossChainTxStatus.PENDING;
                }
                if (status === SymbiosisSwapStatus.STUCKED) {
                    return CrossChainTxStatus.REVERT;
                }

                if (status === SymbiosisSwapStatus.REVERTED) {
                    return CrossChainTxStatus.FALLBACK;
                }

                if (status === SymbiosisSwapStatus.SUCCESS) {
                    return CrossChainTxStatus.SUCCESS;
                }
            } catch (error) {
                console.debug('[Symbiosis Trade] Error retrieving dst tx status', error);
                return CrossChainTxStatus.PENDING;
            }
        }

        return CrossChainTxStatus.PENDING;
    }

    private async getLifiDstSwapStatus(
        data: CrossChainTradeData,
        srcTxReceipt: TransactionReceipt
    ): Promise<CrossChainTxStatus> {
        const requestParams = {
            bridge: data.bridgeType as string,
            fromChain: BlockchainsInfo.getBlockchainByName(data.fromBlockchain).id,
            toChain: BlockchainsInfo.getBlockchainByName(data.toBlockchain).id,
            txHash: srcTxReceipt.transactionHash
        };

        try {
            const { status } = await this.httpClient.get<{ status: LifiSwapStatus }>(
                'https://li.quest/v1/',
                { params: requestParams }
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
                            data.toBlockchain as Exclude<BlockchainName, 'SOLANA' | 'NEAR'>
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
