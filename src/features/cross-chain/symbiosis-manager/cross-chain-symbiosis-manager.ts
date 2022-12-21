import {
    Log as EthersLog,
    TransactionReceipt as EthersReceipt,
    TransactionRequest
} from '@ethersproject/providers';
import { RubicSdkError } from 'src/common/errors';
import { Token } from 'src/common/tokens';
import { combineOptions, deadlineMinutesTimestamp } from 'src/common/utils/options';
import { BlockchainName } from 'src/core/blockchain/models/blockchain-name';
import { CHAIN_TYPE } from 'src/core/blockchain/models/chain-type';
import { blockchainId } from 'src/core/blockchain/utils/blockchains-info/constants/blockchain-id';
import { EvmWeb3Private } from 'src/core/blockchain/web3-private-service/web3-private/evm-web3-private/evm-web3-private';
import { Injector } from 'src/core/injector/injector';
import { getSymbiosisV1Config } from 'src/features/cross-chain/calculation-manager/providers/symbiosis-provider/constants/symbiosis-v1-config';
import { getSymbiosisV2Config } from 'src/features/cross-chain/calculation-manager/providers/symbiosis-provider/constants/symbiosis-v2-config';
import {
    RequiredRevertSwapTransactionOptions,
    RevertSwapTransactionOptions
} from 'src/features/cross-chain/symbiosis-manager/models/revert-swap-transaction-options';
import {
    CHAINS_PRIORITY,
    PendingRequest as PendingRequestV2,
    Symbiosis as SymbiosisV2,
    WaitForComplete as WaitForCompleteV2
} from 'symbiosis-js-sdk';
import { ChainId } from 'symbiosis-js-sdk/dist/constants';
import {
    PendingRequest as PendingRequestV1,
    Symbiosis as SymbiosisV1,
    Token as SymbiosisToken,
    WaitForComplete as WaitForCompleteV1
} from 'symbiosis-js-sdk-v1';
import { TransactionReceipt } from 'web3-eth';

export class CrossChainSymbiosisManager {
    private readonly symbiosisV1 = new SymbiosisV1(getSymbiosisV1Config(), 'rubic');

    private readonly symbiosisV2 = new SymbiosisV2(getSymbiosisV2Config(), 'rubic');

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

    public async getUserTrades(
        fromAddress?: string
    ): Promise<
        ((PendingRequestV1 & { version: 'v1' }) | (PendingRequestV2 & { version: 'v2' }))[]
    > {
        fromAddress ||= this.walletAddress;
        if (!fromAddress) {
            throw new RubicSdkError('`fromAddress` parameter or wallet address must not be empty');
        }

        const requests = await Promise.all([
            (
                await this.symbiosisV1.getPendingRequests(fromAddress)
            ).map(request => ({ ...request, version: 'v1' as const })),
            (
                await this.symbiosisV2.getPendingRequests(fromAddress)
            ).map(request => ({ ...request, version: 'v2' as const }))
        ]);
        return requests.flat();
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
        receipt: TransactionReceipt & { version: 'v1' | 'v2' }
    ): Promise<EthersLog> {
        const fromChainId = blockchainId[fromBlockchain] as ChainId;
        const toChainId = blockchainId[toBlockchain] as ChainId;

        if (receipt.version === 'v1') {
            const tokenOut = new SymbiosisToken({
                chainId: toChainId,
                address: toToken.isNative ? '' : toToken.address,
                decimals: toToken.decimals,
                isNative: toToken.isNative
            });
            return await new WaitForCompleteV1({
                direction: this.getDirection(fromChainId, toChainId),
                symbiosis: this.symbiosisV1,
                revertableAddress: this.walletAddress,
                tokenOut,
                chainIdIn: fromChainId
            }).waitForComplete(receipt as unknown as EthersReceipt);
        }

        return await new WaitForCompleteV2({
            direction: this.getDirection(fromChainId, toChainId),
            symbiosis: this.symbiosisV2,
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

        let transactionRequest: TransactionRequest;
        if (request.version === 'v1') {
            ({ transactionRequest } = await this.symbiosisV1.newRevertPending(request).revert());
        } else {
            const fullOptions = combineOptions(options, this.defaultRevertOptions);
            const slippage = fullOptions.slippageTolerance * 10000;
            const deadline = deadlineMinutesTimestamp(fullOptions.deadline);
            ({ transactionRequest } = await this.symbiosisV2
                .newRevertPending(request)
                .revert(slippage, deadline));
        }

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
