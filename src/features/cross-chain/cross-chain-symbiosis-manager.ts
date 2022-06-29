import {
    ChainId,
    CHAINS_PRIORITY,
    Symbiosis,
    Token as SymbiosisToken,
    PendingRequest,
    WaitForComplete
} from 'symbiosis-js-sdk';
import { getSymbiosisConfig } from '@rsdk-features/cross-chain/providers/symbiosis-trade-provider/constants/symbiosis-config';
import { Injector } from '@rsdk-core/sdk/injector';
import BigNumber from 'bignumber.js';
import { SwapTransactionOptions } from 'src/features';
import { FailedToCheckForTransactionReceiptError, RubicSdkError } from 'src/common';
import { BlockchainName, BlockchainsInfo, Token } from 'src/core';
import { TransactionReceipt as EthersReceipt, Log as EthersLog } from '@ethersproject/providers';
import { TransactionReceipt } from 'web3-eth';

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

    /**
     * Waiting for symbiosis trade to complete.
     * @param fromBlockchain Trade from blockchain.
     * @param toBlockchain Trade to blockchain.
     * @param toToken Trade to toke.
     * @param receipt Transaction receipt.
     * @returns Promise<EthersLog>
     */
    public async waitForComplete(
        fromBlockchain: BlockchainName,
        toBlockchain: BlockchainName,
        toToken: Token,
        receipt: TransactionReceipt
    ): Promise<EthersLog> {
        const fromChainId = BlockchainsInfo.getBlockchainByName(fromBlockchain).id as ChainId;
        const toChainId = BlockchainsInfo.getBlockchainByName(toBlockchain).id as ChainId;
        const tokenOut = new SymbiosisToken({
            chainId: toChainId,
            address: toToken.isNative ? '' : toToken.address,
            decimals: toToken.decimals,
            isNative: toToken.isNative
        });

        return await new WaitForComplete({
            direction: this.getDirection(fromChainId, toChainId),
            symbiosis: this.symbiosis,
            revertableAddress: this.walletAddress,
            tokenOut,
            chainIdIn: fromChainId
        }).waitForComplete(receipt as unknown as EthersReceipt);
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

    private getDirection(chainIdIn: ChainId, chainIdOut: ChainId): 'burn' | 'mint' {
        const indexIn = CHAINS_PRIORITY.indexOf(chainIdIn);
        const indexOut = CHAINS_PRIORITY.indexOf(chainIdOut);

        return indexIn > indexOut ? 'burn' : 'mint';
    }
}
