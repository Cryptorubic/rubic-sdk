import { blockchainId } from 'src/core/blockchain/utils/blockchains-info/constants/blockchain-id';
import { EvmEncodeConfig } from 'src/core/blockchain/web3-pure/typed-web3-pure/evm-web3-pure/models/evm-encode-config';
import { EncodeTransactionOptions } from 'src/features/common/models/encode-transaction-options';
import { UniZenSwapResponse } from 'src/features/common/providers/unizen/models/cross-chain-models/unizen-ccr-swap-response';
import { UniZenOnChainQuoteResponse } from 'src/features/common/providers/unizen/models/on-chain-models/unizen-on-chain-quote-response';
import { UniZenOnChainQuoteParams } from 'src/features/common/providers/unizen/models/unizen-quote-params';
import { UniZenOnChainSwapParams } from 'src/features/common/providers/unizen/models/unizen-swap-params';
import { UniZenApiService } from 'src/features/common/providers/unizen/services/unizen-api-service';

import { ON_CHAIN_TRADE_TYPE } from '../../common/models/on-chain-trade-type';
import { AggregatorEvmOnChainTrade } from '../../common/on-chain-aggregator/aggregator-evm-on-chain-trade-abstract';
import { EvmEncodedConfigAndToAmount } from '../../common/on-chain-aggregator/models/aggregator-on-chain-types';
import { UniZenOnChainTradeStruct } from './models/unizen-on-chain-trade-struct';
import { UniZenOnChainUtilsService } from './utils/unizen-on-chain-utils-service';

export class UniZenOnChainTrade extends AggregatorEvmOnChainTrade {
    public readonly type = ON_CHAIN_TRADE_TYPE.UNIZEN;

    public get dexContractAddress(): string {
        return this.unizenContractAddress;
    }

    private readonly unizenContractAddress: string;

    constructor(tradeStruct: UniZenOnChainTradeStruct, providerAddress: string) {
        super(tradeStruct, providerAddress);

        this.unizenContractAddress = tradeStruct.unizenContractAddress;
    }

    protected async getTransactionConfigAndAmount(
        options: EncodeTransactionOptions
    ): Promise<EvmEncodedConfigAndToAmount> {
        const chainId = blockchainId[this.from.blockchain];

        const quoteInfo = await this.getBestQuote(chainId, options.receiverAddress);

        const toAmount = quoteInfo.toTokenAmount;

        const swapSendParams: UniZenOnChainSwapParams = {
            transactionData: quoteInfo.transactionData,
            nativeValue: quoteInfo.nativeValue,
            account: this.walletAddress,
            receiver: options.receiverAddress || this.walletAddress,
            tradeType: quoteInfo.tradeType
        };

        const swapInfo = await UniZenApiService.getSwapInfo<UniZenSwapResponse>(
            swapSendParams,
            chainId,
            'single'
        );

        const evmConfig: EvmEncodeConfig = {
            data: swapInfo.data,
            to: this.unizenContractAddress,
            value: swapInfo.nativeValue
        };

        return { tx: evmConfig, toAmount };
    }

    private async getBestQuote(
        chainId: number,
        receiver?: string
    ): Promise<UniZenOnChainQuoteResponse> {
        const quoteSendParams: UniZenOnChainQuoteParams = {
            fromTokenAddress: this.from.address,
            toTokenAddress: this.to.address,
            amount: this.fromWithoutFee.stringWeiAmount,
            sender: this.walletAddress,
            slippage: this.slippageTolerance,
            receiver: receiver || this.walletAddress
        };

        return UniZenOnChainUtilsService.getBestQuote(quoteSendParams, chainId);
    }
}
