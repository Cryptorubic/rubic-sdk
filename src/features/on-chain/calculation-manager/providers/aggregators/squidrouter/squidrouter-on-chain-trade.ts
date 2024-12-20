import { EncodeTransactionOptions } from 'src/features/common/models/encode-transaction-options';
import { SquidrouterTransactionRequest } from 'src/features/common/providers/squidrouter/models/transaction-request';
import { SquidRouterApiService } from 'src/features/common/providers/squidrouter/services/squidrouter-api-service';
import { SquidrouterContractAddress } from 'src/features/cross-chain/calculation-manager/providers/squidrouter-provider/constants/squidrouter-contract-address';
import { SquidrouterCrossChainSupportedBlockchain } from 'src/features/cross-chain/calculation-manager/providers/squidrouter-provider/constants/squidrouter-cross-chain-supported-blockchain';

import { ON_CHAIN_TRADE_TYPE } from '../../common/models/on-chain-trade-type';
import { AggregatorEvmOnChainTrade } from '../../common/on-chain-aggregator/aggregator-evm-on-chain-trade-abstract';
import { EvmEncodedConfigAndToAmount } from '../../common/on-chain-aggregator/models/aggregator-on-chain-types';
import { SquidRouterOnChainTradeStruct } from './models/squidrouter-on-chain-trade-struct';

export class SquidRouterOnChainTrade extends AggregatorEvmOnChainTrade {
    public readonly type = ON_CHAIN_TRADE_TYPE.SQUIDROUTER;

    private readonly requestParams: SquidrouterTransactionRequest;

    public readonly providerGateway: string;

    public squidrouterRequestId: string | undefined;

    public get dexContractAddress(): string {
        const fromBlockchain = this.from.blockchain as SquidrouterCrossChainSupportedBlockchain;
        return SquidrouterContractAddress[fromBlockchain].providerRouter;
    }

    constructor(
        tradeStruct: SquidRouterOnChainTradeStruct,
        providerAddress: string,
        providerGateway: string
    ) {
        super(tradeStruct, providerAddress);
        this.requestParams = tradeStruct.transactionRequest;

        this.providerGateway = providerGateway;
    }

    protected async getTransactionConfigAndAmount(
        options: EncodeTransactionOptions
    ): Promise<EvmEncodedConfigAndToAmount> {
        const requestParams: SquidrouterTransactionRequest = {
            ...this.requestParams,
            toAddress: options.receiverAddress || this.walletAddress
        };

        const res = await SquidRouterApiService.getRoute(requestParams);
        this.squidrouterRequestId = res['x-request-id'];
        const route = res.route;

        return {
            tx: {
                data: route.transactionRequest.data,
                value: route.transactionRequest.value,
                to: route.transactionRequest.target
            },
            toAmount: route.estimate.toAmount
        };
    }
}
