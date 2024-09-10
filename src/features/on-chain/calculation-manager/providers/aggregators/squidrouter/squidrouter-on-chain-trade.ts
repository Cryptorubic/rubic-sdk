import BigNumber from 'bignumber.js';
import { RubicSdkError } from 'src/common/errors';
import { EvmWeb3Pure } from 'src/core/blockchain/web3-pure/typed-web3-pure/evm-web3-pure/evm-web3-pure';
import { EncodeTransactionOptions } from 'src/features/common/models/encode-transaction-options';
import { SquidrouterTransactionRequest } from 'src/features/common/providers/squidrouter/models/transaction-request';
import { SquidRouterApiService } from 'src/features/common/providers/squidrouter/services/squidrouter-api-service';

import { getOnChainGasData } from '../../../utils/get-on-chain-gas-data';
import { ON_CHAIN_TRADE_TYPE } from '../../common/models/on-chain-trade-type';
import { AggregatorEvmOnChainTrade } from '../../common/on-chain-aggregator/aggregator-evm-on-chain-trade-abstract';
import { GetToAmountAndTxDataResponse } from '../../common/on-chain-aggregator/models/aggregator-on-chain-types';
import { SquidRouterOnChainTradeStruct } from './models/squidrouter-on-chain-trade-struct';

export class SquidRouterOnChainTrade extends AggregatorEvmOnChainTrade {
    public static async getGasLimit(
        tradeStruct: SquidRouterOnChainTradeStruct,
        providerGateway: string
    ): Promise<BigNumber | null> {
        const trade = new SquidRouterOnChainTrade(
            tradeStruct,
            EvmWeb3Pure.EMPTY_ADDRESS,
            providerGateway
        );

        return getOnChainGasData(trade);
    }

    public readonly type = ON_CHAIN_TRADE_TYPE.SQUIDROUTER;

    private readonly requestParams: SquidrouterTransactionRequest;

    public readonly providerGateway: string;

    public get dexContractAddress(): string {
        throw new RubicSdkError('Dex address is unknown before swap is started');
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
    ): Promise<GetToAmountAndTxDataResponse> {
        const requestParams: SquidrouterTransactionRequest = {
            ...this.requestParams,
            toAddress: options.receiverAddress || this.walletAddress
        };

        const {
            route: { transactionRequest, estimate }
        } = await SquidRouterApiService.getRoute(requestParams);

        return {
            tx: {
                data: transactionRequest.data,
                value: transactionRequest.value,
                to: transactionRequest.targetAddress
            },
            toAmount: estimate.toAmount
        };
    }
}
