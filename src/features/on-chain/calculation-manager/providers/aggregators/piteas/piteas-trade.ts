import { RubicSdkError } from 'src/common/errors';
import { EvmEncodeConfig } from 'src/core/blockchain/web3-pure/typed-web3-pure/evm-web3-pure/models/evm-encode-config';
import { EncodeTransactionOptions } from 'src/features/common/models/encode-transaction-options';
import { rubicProxyContractAddress } from 'src/features/cross-chain/calculation-manager/providers/common/constants/rubic-proxy-contract-address';
import { piteasRouterAddress } from 'src/features/on-chain/calculation-manager/providers/aggregators/piteas/constants/piteas-router-address';
import { PiteasQuoteRequestParams } from 'src/features/on-chain/calculation-manager/providers/aggregators/piteas/models/piteas-quote';
import { PiteasTradeStruct } from 'src/features/on-chain/calculation-manager/providers/aggregators/piteas/models/piteas-trade-struct';
import { PiteasApiService } from 'src/features/on-chain/calculation-manager/providers/aggregators/piteas/piteas-api-service';
import {
    ON_CHAIN_TRADE_TYPE,
    OnChainTradeType
} from 'src/features/on-chain/calculation-manager/providers/common/models/on-chain-trade-type';
import { AggregatorEvmOnChainTrade } from 'src/features/on-chain/calculation-manager/providers/common/on-chain-aggregator/aggregator-evm-on-chain-trade-abstract';
import { EvmEncodedConfigAndToAmount } from 'src/features/on-chain/calculation-manager/providers/common/on-chain-aggregator/models/aggregator-on-chain-types';

export class PiteasTrade extends AggregatorEvmOnChainTrade {
    public readonly type: OnChainTradeType = ON_CHAIN_TRADE_TYPE.PITEAS;

    public readonly providerGateway = piteasRouterAddress;

    private readonly quoteRequestParams: PiteasQuoteRequestParams;

    protected get spenderAddress(): string {
        return this.useProxy
            ? rubicProxyContractAddress[this.from.blockchain].gateway
            : this.providerGateway;
    }

    public get dexContractAddress(): string {
        return piteasRouterAddress;
    }

    constructor(
        tradeStruct: PiteasTradeStruct,
        providerAddress: string,
        quoteRequestParams: PiteasQuoteRequestParams
    ) {
        super(tradeStruct, providerAddress);

        this.quoteRequestParams = quoteRequestParams;
    }

    protected async getTransactionConfigAndAmount(
        options: EncodeTransactionOptions
    ): Promise<EvmEncodedConfigAndToAmount> {
        const account = options.receiverAddress || options.fromAddress;
        try {
            const { destAmount, gasUseEstimate, methodParameters } =
                await PiteasApiService.fetchQuote({
                    ...this.quoteRequestParams,
                    account
                });

            const tx: EvmEncodeConfig = {
                to: piteasRouterAddress,
                data: methodParameters.calldata,
                value: methodParameters.value,
                gas: gasUseEstimate.toString()
            };

            return {
                tx,
                toAmount: destAmount
            };
        } catch (error) {
            if ('statusCode' in error && 'message' in error) {
                throw new RubicSdkError(error.message);
            }
            throw error;
        }
    }
}
