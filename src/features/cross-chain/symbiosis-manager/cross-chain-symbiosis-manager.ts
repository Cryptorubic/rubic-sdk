import { Log as EthersLog, TransactionReceipt as EthersReceipt } from '@ethersproject/providers';
import { RubicSdkError } from 'src/common/errors';
import { combineOptions, deadlineMinutesTimestamp } from 'src/common/utils/options';
import { BlockchainName } from 'src/core/blockchain/models/blockchain-name';
import { CHAIN_TYPE } from 'src/core/blockchain/models/chain-type';
import { blockchainId } from 'src/core/blockchain/utils/blockchains-info/constants/blockchain-id';
import { EvmWeb3Private } from 'src/core/blockchain/web3-private-service/web3-private/evm-web3-private/evm-web3-private';
import { Injector } from 'src/core/injector/injector';
import {
    RequiredRevertSwapTransactionOptions,
    RevertSwapTransactionOptions
} from 'src/features/cross-chain/symbiosis-manager/models/revert-swap-transaction-options';
import { CHAINS_PRIORITY, PendingRequest, Symbiosis, WaitForComplete } from 'symbiosis-js-sdk';
import { ChainId } from 'symbiosis-js-sdk/dist/constants';
import { TransactionReceipt } from 'web3-eth';

export class CrossChainSymbiosisManager {
    private readonly symbiosis = new Symbiosis('mainnet', 'rubic');

    private readonly defaultRevertOptions: RequiredRevertSwapTransactionOptions = {
        slippageTolerance: 0.02,
        deadline: 20
    };

    private get web3Private(): EvmWeb3Private {
        return Injector.web3PrivateService.getWeb3Private(CHAIN_TYPE.EVM);
    }

    private get walletAddress(): string {
        return this.web3Private.address;
    }

    public getUserTrades(fromAddress?: string): Promise<PendingRequest[]> {
        fromAddress ||= this.walletAddress;
        if (!fromAddress) {
            throw new RubicSdkError('`fromAddress` parameter or wallet address must not be empty');
        }

        return this.symbiosis.getPendingRequests(fromAddress);
    }

    /**
     * Waiting for symbiosis trade to complete.
     * @param fromBlockchain Trade from blockchain.
     * @param toBlockchain Trade to blockchain.
     * @param receipt Transaction receipt.
     * @returns Promise<EthersLog>
     */
    public async waitForComplete(
        fromBlockchain: BlockchainName,
        toBlockchain: BlockchainName,
        receipt: TransactionReceipt
    ): Promise<EthersLog> {
        const fromChainId = blockchainId[fromBlockchain] as ChainId;
        const toChainId = blockchainId[toBlockchain] as ChainId;

        return await new WaitForComplete({
            direction: this.getDirection(fromChainId, toChainId),
            symbiosis: this.symbiosis,
            revertableAddress: this.walletAddress,
            chainIdOut: toChainId,
            chainIdIn: fromChainId
        }).waitForComplete(receipt as unknown as EthersReceipt);
    }

    public async revertTrade(
        revertTransactionHash: string,
        options: RevertSwapTransactionOptions = {}
    ): Promise<TransactionReceipt> {
        const pendingRequest = await this.getUserTrades();
        const request = pendingRequest.find(
            pendingRequest =>
                pendingRequest.transactionHash.toLowerCase() === revertTransactionHash.toLowerCase()
        );

        if (!request) {
            throw new RubicSdkError('No request with provided transaction hash');
        }

        const fullOptions = combineOptions(options, this.defaultRevertOptions);
        const slippage = fullOptions.slippageTolerance * 10000;
        const deadline = deadlineMinutesTimestamp(fullOptions.deadline);
        const { transactionRequest } = await this.symbiosis
            .newRevertPending(request)
            .revert(slippage, deadline);

        const { onConfirm, gasLimit, gasPrice } = options;
        const onTransactionHash = (hash: string) => {
            if (onConfirm) {
                onConfirm(hash);
            }
        };

        return this.web3Private.trySendTransaction(transactionRequest.to!, {
            data: transactionRequest.data!.toString(),
            value: transactionRequest.value?.toString() || '0',
            onTransactionHash,
            gas: gasLimit,
            gasPrice
        });
    }

    private getDirection(chainIdIn: ChainId, chainIdOut: ChainId): 'burn' | 'mint' {
        const indexIn = CHAINS_PRIORITY.indexOf(chainIdIn);
        const indexOut = CHAINS_PRIORITY.indexOf(chainIdOut);

        return indexIn > indexOut ? 'burn' : 'mint';
    }
}
