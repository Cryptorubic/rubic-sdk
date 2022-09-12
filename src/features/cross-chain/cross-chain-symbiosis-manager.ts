import {
    ChainId,
    CHAINS_PRIORITY,
    PendingRequest,
    Symbiosis,
    Token as SymbiosisToken,
    WaitForComplete
} from 'symbiosis-js-sdk';
import { TransactionReceipt } from 'web3-eth';
import { getSymbiosisConfig } from 'src/features/cross-chain/providers/symbiosis-trade-provider/constants/symbiosis-config';
import { BlockchainsInfo } from 'src/core/blockchain/utils/blockchains-info';
import { RubicSdkError } from 'src/common/errors';
import { BlockchainName } from 'src/core/blockchain/models/blockchain-name';
import { Injector } from 'src/core/injector/injector';
import { SwapTransactionOptions } from 'src/features/instant-trades/models/swap-transaction-options';
import { Web3Private } from 'src/core/blockchain/web3-private-service/web3-private/web3-private';
import { CHAIN_TYPE } from 'src/core/blockchain/models/chain-type';
import { Token } from 'src/common/tokens';
import { Log as EthersLog, TransactionReceipt as EthersReceipt } from '@ethersproject/providers';
import BigNumber from 'bignumber.js';

export class CrossChainSymbiosisManager {
    private readonly symbiosis = new Symbiosis(getSymbiosisConfig(), 'rubic');

    private get web3Private(): Web3Private {
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
    ): Promise<TransactionReceipt> {
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
        const onTransactionHash = (hash: string) => {
            if (onConfirm) {
                onConfirm(hash);
            }
        };

        return this.web3Private.trySendTransaction(
            transactionRequest.to!,
            new BigNumber(transactionRequest.value?.toString() || 0),
            {
                data: transactionRequest.data!.toString(),
                onTransactionHash,
                gas: gasLimit,
                gasPrice
            }
        );
    }

    private getDirection(chainIdIn: ChainId, chainIdOut: ChainId): 'burn' | 'mint' {
        const indexIn = CHAINS_PRIORITY.indexOf(chainIdIn);
        const indexOut = CHAINS_PRIORITY.indexOf(chainIdOut);

        return indexIn > indexOut ? 'burn' : 'mint';
    }
}
