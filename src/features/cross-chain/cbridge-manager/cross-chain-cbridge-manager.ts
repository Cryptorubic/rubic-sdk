export class CrossChainCbridgeManager {
    // private get web3Private(): EvmWeb3Private {
    //     return Injector.web3PrivateService.getWeb3Private(CHAIN_TYPE.EVM);
    // }
    //
    // private get walletAddress(): string {
    //     return this.web3Private.address;
    // }
    //
    // public getUserTrades(fromAddress?: string): Promise<PendingRequest[]> {
    //     fromAddress ||= this.walletAddress;
    //     if (!fromAddress) {
    //         throw new RubicSdkError('`fromAddress` parameter or wallet address must not be empty');
    //     }
    //
    // }
    //
    // /**
    //  * Waiting for symbiosis trade to complete.
    //  * @param fromBlockchain Trade from blockchain.
    //  * @param toBlockchain Trade to blockchain.
    //  * @param toToken Trade to toke.
    //  * @param receipt Transaction receipt.
    //  * @returns Promise<EthersLog>
    //  */
    // public async waitForComplete(
    //     fromBlockchain: BlockchainName,
    //     toBlockchain: BlockchainName,
    //     toToken: Token,
    //     receipt: TransactionReceipt
    // ): Promise<EthersLog> {
    //     const fromChainId = blockchainId[fromBlockchain] as ChainId;
    //     const toChainId = blockchainId[toBlockchain] as ChainId;
    //     const tokenOut = new SymbiosisToken({
    //         chainId: toChainId,
    //         address: toToken.isNative ? '' : toToken.address,
    //         decimals: toToken.decimals,
    //         isNative: toToken.isNative
    //     });
    //
    //     return await new WaitForComplete({
    //         direction: this.getDirection(fromChainId, toChainId),
    //         symbiosis: this.symbiosis,
    //         revertableAddress: this.walletAddress,
    //         tokenOut,
    //         chainIdIn: fromChainId
    //     }).waitForComplete(receipt as unknown as EthersReceipt);
    // }
    //
    // public async revertTrade(
    //     revertTransactionHash: string,
    //     options: SwapTransactionOptions = {}
    // ): Promise<TransactionReceipt> {
    //     const pendingRequest = await this.getUserTrades();
    //     const request = pendingRequest.find(
    //         pendingRequest =>
    //             pendingRequest.transactionHash.toLowerCase() === revertTransactionHash.toLowerCase()
    //     );
    //
    //     if (!request) {
    //         throw new RubicSdkError('No request with provided transaction hash');
    //     }
    //
    //     const { transactionRequest } = await this.symbiosis.newRevertPending(request).revert();
    //
    //     const { onConfirm, gasLimit, gasPrice } = options;
    //     const onTransactionHash = (hash: string) => {
    //         if (onConfirm) {
    //             onConfirm(hash);
    //         }
    //     };
    //
    //     return this.web3Private.trySendTransaction(transactionRequest.to!, {
    //         data: transactionRequest.data!.toString(),
    //         value: transactionRequest.value?.toString() || '0',
    //         onTransactionHash,
    //         gas: gasLimit,
    //         gasPrice
    //     });
    // }
    //
    // private getDirection(chainIdIn: ChainId, chainIdOut: ChainId): 'burn' | 'mint' {
    //     const indexIn = CHAINS_PRIORITY.indexOf(chainIdIn);
    //     const indexOut = CHAINS_PRIORITY.indexOf(chainIdOut);
    //
    //     return indexIn > indexOut ? 'burn' : 'mint';
    // }
}
