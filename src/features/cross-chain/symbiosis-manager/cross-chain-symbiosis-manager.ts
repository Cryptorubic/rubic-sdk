import {
    Log as EthersLog,
    TransactionReceipt as EthersReceipt,
    TransactionRequest
} from '@ethersproject/providers';
import { RubicSdkError } from 'src/common/errors';
import { Token } from 'src/common/tokens';
import { BlockchainName } from 'src/core/blockchain/models/blockchain-name';
import { CHAIN_TYPE } from 'src/core/blockchain/models/chain-type';
import { blockchainId } from 'src/core/blockchain/utils/blockchains-info/constants/blockchain-id';
import { EvmWeb3Private } from 'src/core/blockchain/web3-private-service/web3-private/evm-web3-private/evm-web3-private';
import { Injector } from 'src/core/injector/injector';
import { SwapTransactionOptions } from 'src/features/common/models/swap-transaction-options';
import { SymbiosisRevertResponse } from 'src/features/cross-chain/symbiosis-manager/models/symbiosis-revert-api';
import { SymbiosisStuckedResponse } from 'src/features/cross-chain/symbiosis-manager/models/symbiosis-stucked-api';
import { ChainId, CHAINS_PRIORITY, Symbiosis, WaitForComplete } from 'symbiosis-js-sdk';
import { TransactionReceipt } from 'web3-eth';
import {BlockchainsInfo} from "src/core/blockchain/utils/blockchains-info/blockchains-info";

export class CrossChainSymbiosisManager {
    private get web3Private(): EvmWeb3Private {
        return Injector.web3PrivateService.getWeb3Private(CHAIN_TYPE.EVM);
    }

    private get walletAddress(): string {
        return this.web3Private.address;
    }

    public async getUserTrades(fromAddress?: string): Promise<SymbiosisStuckedResponse[]> {
        fromAddress ||= this.walletAddress;
        if (!fromAddress) {
            throw new RubicSdkError('`fromAddress` parameter or wallet address must not be empty');
        }

        return this.getSymbiosisStuckedTrades(fromAddress);
    }

    private getSymbiosisStuckedTrades(fromAddress: string): Promise<SymbiosisStuckedResponse[]> {
        return Injector.httpClient
            .get<SymbiosisStuckedResponse[]>(
                `https://api-v2.symbiosis.finance/crosschain/v1/stucked/${fromAddress}`
            )
            .then(response => response.filter(trade => Boolean(trade.hash)))
            .catch(() => []);
    }

    public async revertTrade(
        revertTransactionHash: string,
        options: SwapTransactionOptions = {}
    ): Promise<TransactionReceipt> {
        const stuckedTrades = await this.getUserTrades();
        const stuckedTrade = stuckedTrades.find(
            trade => trade.hash.toLowerCase() === revertTransactionHash.toLowerCase()
        );
        if (!stuckedTrade) {
            throw new RubicSdkError('No request with provided transaction hash');
        }

        const transactionRequest = await this.getRevertTransactionRequest(stuckedTrade);

        const blockchain = Object.entries(blockchainId).find(
            ([_, id]) => id === stuckedTrade.chainId
        )![0] as BlockchainName;
        await this.web3Private.checkBlockchainCorrect(blockchain);

        const { onConfirm, gasLimit, gasPrice, gasPriceOptions } = options;
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
            gasPrice,
            gasPriceOptions
        });
    }

    private async getRevertTransactionRequest(
        stuckedTrade: SymbiosisStuckedResponse
    ): Promise<TransactionRequest> {
        return (
            await Injector.httpClient.post<SymbiosisRevertResponse>(
                `https://api-v2.symbiosis.finance/crosschain/v1/revert`,
                {
                    transactionHash: stuckedTrade.hash,
                    chainId: stuckedTrade.chainId
                }
            )
        ).tx;
    }

    /**
     * Waiting for symbiosis trade to complete.
     * @param fromBlockchain Trade from blockchain.
     * @param toBlockchain Trade to blockchain.
     * @param _toToken Trade to toke.
     * @param receipt Transaction receipt.
     * @returns Promise<EthersLog>
     */
    public async waitForComplete(
        fromBlockchain: BlockchainName,
        toBlockchain: BlockchainName,
        _toToken: Token,
        receipt: TransactionReceipt
    ): Promise<EthersLog> {
        const fromChainId = blockchainId[fromBlockchain] as ChainId;
        const toChainId = blockchainId[toBlockchain] as ChainId;
        const config = BlockchainsInfo.isTestBlockchainName(fromBlockchain) ? 'testnet' : 'mainnet';
        const symbiosis = new Symbiosis(config, 'rubic');

        return await new WaitForComplete({
            direction: this.getDirection(fromChainId, toChainId),
            symbiosis,
            revertableAddress: this.walletAddress,
            chainIdOut: toChainId,
            chainIdIn: fromChainId
        }).waitForComplete(receipt as unknown as EthersReceipt);
    }

    private getDirection(chainIdIn: ChainId, chainIdOut: ChainId): 'burn' | 'mint' {
        const indexIn = CHAINS_PRIORITY.indexOf(chainIdIn);
        const indexOut = CHAINS_PRIORITY.indexOf(chainIdOut);

        return indexIn > indexOut ? 'burn' : 'mint';
    }
}
