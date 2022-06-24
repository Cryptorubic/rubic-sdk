import { Symbiosis } from 'symbiosis-js-sdk';
import { getSymbiosisConfig } from '@features/cross-chain/providers/symbiosis-trade-provider/constants/symbiosis-config';
import { Injector } from '@core/sdk/injector';
import { PendingRequest } from 'symbiosis-js-sdk/dist/crosschain/pending';
import BigNumber from 'bignumber.js';
import { SwapTransactionOptions } from 'src/features';
import { FailedToCheckForTransactionReceiptError, RubicSdkError } from 'src/common';

export class CrossChainSymbiosisManager {
    private readonly symbiosis = new Symbiosis(getSymbiosisConfig(), 'rubic');

    private get walletAddress(): string {
        return Injector.web3Private.address;
    }

    public getUserTrades(fromAddress?: string): Promise<PendingRequest[]> {
        fromAddress ||= this.walletAddress;
        if (!fromAddress) {
            throw new RubicSdkError('`fromAddress` parameter or wallet address must not be empty');
        }

        return this.symbiosis.getPendingRequests(fromAddress);
    }

    public async revertTrade(
        revertTransactionHash: string,
        options: SwapTransactionOptions = {}
    ): Promise<string | never> {
        const pendingRequest = await this.getUserTrades();
        const request = pendingRequest.find(
            pendingRequest =>
                pendingRequest.transactionHash.toLowerCase() === revertTransactionHash.toLowerCase()
        );

        if (!request) {
            throw new RubicSdkError('No request with provided transaction hash');
        }

        const { transactionRequest } = await this.symbiosis.newRevertPending(request).revert();

        const { onConfirm, gasLimit, gasPrice } = options;
        let transactionHash: string;
        const onTransactionHash = (hash: string) => {
            if (onConfirm) {
                onConfirm(hash);
            }
            transactionHash = hash;
        };

        try {
            await Injector.web3Private.trySendTransaction(
                transactionRequest.to!,
                new BigNumber(transactionRequest.value?.toString() || 0),
                {
                    data: transactionRequest.data!.toString(),
                    onTransactionHash,
                    gas: gasLimit,
                    gasPrice
                }
            );

            return transactionHash!;
        } catch (err) {
            if (err instanceof FailedToCheckForTransactionReceiptError) {
                return transactionHash!;
            }
            throw err;
        }
    }
}
