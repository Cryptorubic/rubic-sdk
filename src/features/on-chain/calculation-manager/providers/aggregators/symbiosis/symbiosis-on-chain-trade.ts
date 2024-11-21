import { RubicSdkError } from 'src/common/errors';
import { EncodeTransactionOptions } from 'src/features/common/models/encode-transaction-options';
import { SymbiosisApiService } from 'src/features/common/providers/symbiosis/services/symbiosis-api-service';
import { SymbiosisParser } from 'src/features/common/providers/symbiosis/services/symbiosis-parser';
import { rubicProxyContractAddress } from 'src/features/cross-chain/calculation-manager/providers/common/constants/rubic-proxy-contract-address';

import { ON_CHAIN_TRADE_TYPE, OnChainTradeType } from '../../common/models/on-chain-trade-type';
import { AggregatorEvmOnChainTrade } from '../../common/on-chain-aggregator/aggregator-evm-on-chain-trade-abstract';
import { EvmEncodedConfigAndToAmount } from '../../common/on-chain-aggregator/models/aggregator-on-chain-types';
import { SymbiosisTradeStruct } from './models/symbiosis-on-chain-trade-types';

export class SymbiosisOnChainTrade extends AggregatorEvmOnChainTrade {
    public readonly type: OnChainTradeType = ON_CHAIN_TRADE_TYPE.SYMBIOSIS_SWAP;

    public readonly providerGateway: string;

    protected get spenderAddress(): string {
        return this.useProxy
            ? rubicProxyContractAddress[this.from.blockchain].gateway
            : this.providerGateway;
    }

    public get dexContractAddress(): string {
        throw new RubicSdkError('Dex address is unknown before swap is started');
    }

    constructor(
        tradeStruct: SymbiosisTradeStruct,
        providerAddress: string,
        providerGateway: string
    ) {
        super(tradeStruct, providerAddress);

        this.providerGateway = providerGateway;
    }

    //@TODO - CHECK IF we need to pass fromAddress with proxy or remove it after listing
    protected async getTransactionConfigAndAmount(
        options: EncodeTransactionOptions
    ): Promise<EvmEncodedConfigAndToAmount> {
        const requestBody = await SymbiosisParser.getSwapRequestBody(this.from, this.to, {
            receiverAddress: options.receiverAddress,
            fromAddress: this.walletAddress,
            slippage: this.slippageTolerance
        });

        const { tx, tokenAmountOut } = await SymbiosisApiService.getOnChainSwapTx(requestBody);

        return {
            tx,
            toAmount: tokenAmountOut.amount
        };
    }
}
