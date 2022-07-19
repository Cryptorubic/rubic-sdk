import { TransactionReceipt } from 'web3-eth';
import { BlockchainName } from 'src/core';
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

export class CrossChainSwapStatusManager {
    private tradeFn = {
        [CROSS_CHAIN_TRADE_TYPE.CELER]: this.getCelerDstSwapStatus,
        [CROSS_CHAIN_TRADE_TYPE.RUBIC]: this.getRubicDstSwapStatus,
        [CROSS_CHAIN_TRADE_TYPE.LIFI]: this.getLifiDstSwapStatus,
        [CROSS_CHAIN_TRADE_TYPE.SYMBIOSIS]: this.getSymbiosisDstSwapStatus
    };

    public async getCrossChainStatus(
        fromBlockchain: BlockchainName,
        toBlockchain: BlockchainName,
        srcTxHash: string,
        provider: CrossChainTradeType
    ): Promise<CrossChainStatus> {
        const crossChainStatus: CrossChainStatus = {
            srcTxStatus: CrossChainTxStatus.UNKNOWN,
            dstTxStatus: CrossChainTxStatus.UNKNOWN
        };

        const srcTxReceipt = await this.getTxReceipt(fromBlockchain, srcTxHash);
        const srcTxStatus = this.getSrcTxStatus(srcTxReceipt);

        crossChainStatus.srcTxStatus = srcTxStatus;

        const dstTxStatus = await this.getDstTxStatus(
            srcTxStatus,
            toBlockchain,
            srcTxReceipt as TransactionReceipt,
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
        toBlockchain: BlockchainName,
        srcTxReceipt: TransactionReceipt,
        provider: CrossChainTradeType
    ): Promise<CrossChainTxStatus> {
        if (srcTxStatus === CrossChainTxStatus.FAIL) {
            return CrossChainTxStatus.FAIL;
        }

        if (srcTxStatus === CrossChainTxStatus.PENDING) {
            return CrossChainTxStatus.PENDING;
        }

        const tradeFn = this.tradeFn[provider];
        const dstTxStatus = await tradeFn(toBlockchain, srcTxReceipt);

        return dstTxStatus;
    }

    private async getLifiDstSwapStatus(): Promise<CrossChainTxStatus> {
        return CrossChainTxStatus.SUCCESS;
    }

    private async getSymbiosisDstSwapStatus(): Promise<CrossChainTxStatus> {
        return CrossChainTxStatus.SUCCESS;
    }

    private async getCelerDstSwapStatus(
        toBlockchain: BlockchainName,
        srcTxReceipt: TransactionReceipt
    ): Promise<CrossChainTxStatus> {
        try {
            const [requestLog] = decodeLogs(celerCrossChainContractAbi, srcTxReceipt).filter(
                Boolean
            ); // filter undecoded logs
            const dstTxStatus = Number(
                await Injector.web3PublicService
                    .getWeb3Public(toBlockchain)
                    .callContractMethod(
                        celerCrossChainContractsAddresses[
                            toBlockchain as CelerCrossChainSupportedBlockchain
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
            console.debug('[Celer] error retrieving tx status', error);
            return CrossChainTxStatus.PENDING;
        }
    }

    private async getRubicDstSwapStatus(
        toBlockchain: BlockchainName,
        srcTxReceipt: TransactionReceipt
    ): Promise<CrossChainTxStatus> {
        try {
            const dstTxStatus = Number(
                await Injector.web3PublicService
                    .getWeb3Public(toBlockchain)
                    .callContractMethod(
                        rubicCrossChainContractsAddresses[
                            toBlockchain as Exclude<BlockchainName, 'SOLANA' | 'NEAR'>
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
            console.debug('[Rubic] Error retrieving tx status', error);
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
        } catch (error: unknown) {
            console.debug('Error retrieving src tx receipt', { error, txHash });
            receipt = null;
        }

        return receipt;
    }
}
