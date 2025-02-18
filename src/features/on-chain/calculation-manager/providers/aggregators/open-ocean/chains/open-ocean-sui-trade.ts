export class OpenOceanSuiTrade /* extends AggregatorSuiOnChainTrade */ {
    // public readonly type = ON_CHAIN_TRADE_TYPE.OPEN_OCEAN;
    //
    // protected get spenderAddress(): string {
    //     throw new Error('Not implemented');
    // }
    //
    // public get dexContractAddress(): string {
    //     throw new RubicSdkError('Dex address is unknown before swap is started');
    // }
    //
    // constructor(tradeStruct: SuiOnChainTradeStruct, providerAddress: string) {
    //     super(tradeStruct, providerAddress);
    // }
    //
    // public async encodeDirect(options: EncodeTransactionOptions): Promise<SuiEncodeConfig> {
    //     await this.checkFromAddress(options.fromAddress, true);
    //     checkUnsupportedReceiverAddress(
    //         options?.receiverAddress,
    //         options?.fromAddress || this.walletAddress
    //     );
    //
    //     try {
    //         const transactionData = await this.getTxConfigAndCheckAmount(
    //             options.receiverAddress,
    //             options.fromAddress,
    //             options.skipAmountCheck
    //         );
    //
    //         return {
    //             transaction: transactionData.transaction
    //         };
    //     } catch (err) {
    //         if ([400, 500, 503].includes(err.code)) {
    //             throw new SwapRequestError();
    //         }
    //
    //         if (err instanceof UpdatedRatesError || err instanceof RubicSdkError) {
    //             throw err;
    //         }
    //         throw new RubicSdkError('Can not encode trade');
    //     }
    // }
    //
    // protected async getToAmountAndTxData(
    //     receiverAddress?: string,
    //     fromAddress?: string
    // ): Promise<SuiEncodedConfigAndToAmount> {
    //     const swapQuoteResponse = await OpenOceanApiService.fetchSuiSwapData(
    //         this.fromWithoutFee as PriceTokenAmount<SuiBlockchainName>,
    //         this.to,
    //         receiverAddress || fromAddress || this.walletAddress,
    //         this.slippageTolerance
    //     );
    //     const tx = swapQuoteResponse.transaction;
    //     const toAmount = swapQuoteResponse.
    //     return { transaction: tx, toAmount };
    // }
}
