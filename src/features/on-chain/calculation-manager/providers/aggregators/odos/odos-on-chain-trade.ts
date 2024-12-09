import { RubicSdkError } from 'src/common/errors';
import { EncodeTransactionOptions } from 'src/features/common/models/encode-transaction-options';
import { rubicProxyContractAddress } from 'src/features/cross-chain/calculation-manager/providers/common/constants/rubic-proxy-contract-address';
import { AggregatorEvmOnChainTrade } from 'src/features/on-chain/calculation-manager/providers/common/on-chain-aggregator/aggregator-evm-on-chain-trade-abstract';

import { ON_CHAIN_TRADE_TYPE } from '../../common/models/on-chain-trade-type';
import { EvmEncodedConfigAndToAmount } from '../../common/on-chain-aggregator/models/aggregator-on-chain-types';
import { OdosBestRouteRequestBody } from './models/odos-api-best-route-types';
import { OdosOnChainTradeStruct } from './models/odos-on-chain-trade-types';
import { OdosOnChainApiService } from './services/odos-on-chain-api-service';

export class OdosOnChainTrade extends AggregatorEvmOnChainTrade {
    public readonly type = ON_CHAIN_TRADE_TYPE.ODOS;

    public readonly providerGateway: string;

    private bestRouteRequestBody: OdosBestRouteRequestBody;

    public get dexContractAddress(): string {
        throw new RubicSdkError('Dex address is unknown before swap is started');
    }

    protected get spenderAddress(): string {
        return this.useProxy
            ? rubicProxyContractAddress[this.from.blockchain].gateway
            : this.providerGateway;
    }

    constructor(
        tradeStruct: OdosOnChainTradeStruct,
        providerAddress: string,
        providerGateway: string
    ) {
        super(tradeStruct, providerAddress);
        this.bestRouteRequestBody = tradeStruct.bestRouteRequestBody;
        this.providerGateway = providerGateway;
    }

    protected async getTransactionConfigAndAmount(
        options: EncodeTransactionOptions
    ): Promise<EvmEncodedConfigAndToAmount> {
        const { pathId } = await OdosOnChainApiService.getBestRoute(this.bestRouteRequestBody);

        const { transaction, outputTokens } = await OdosOnChainApiService.getSwapTx({
            userAddr: this.walletAddress,
            receiver: options.receiverAddress,
            pathId
        });

        const toAmount = outputTokens[0]!.amount;

        return {
            tx: {
                data: transaction!.data,
                to: transaction!.to,
                value: transaction!.value
            },
            toAmount
        };
    }
}
