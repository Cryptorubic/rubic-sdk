import { RubicSdkError } from 'src/common/errors';
import { PriceTokenAmount } from 'src/common/tokens';
import { EncodeTransactionOptions } from 'src/features/common/models/encode-transaction-options';
import { RangoBestRouteSimulationResult } from 'src/features/common/providers/rango/models/rango-api-best-route-types';
import { RangoTransaction } from 'src/features/common/providers/rango/models/rango-api-swap-types';
import { RangoCommonParser } from 'src/features/common/providers/rango/services/rango-parser';
import { rubicProxyContractAddress } from 'src/features/cross-chain/calculation-manager/providers/common/constants/rubic-proxy-contract-address';

import { ON_CHAIN_TRADE_TYPE, OnChainTradeType } from '../../common/models/on-chain-trade-type';
import { AggregatorEvmOnChainTrade } from '../../common/on-chain-aggregator/aggregator-evm-on-chain-trade-abstract';
import { EvmEncodedConfigAndToAmount } from '../../common/on-chain-aggregator/models/aggregator-on-chain-types';
import { RANGO_ON_CHAIN_DISABLED_PROVIDERS } from './models/rango-on-chain-disabled-providers';
import { RangoOnChainTradeStruct } from './models/rango-on-chain-trade-types';
import { RangoOnChainApiService } from './services/rango-on-chain-api-service';

export class RangoOnChainTrade extends AggregatorEvmOnChainTrade {
    /**
     * approveTo address - used in this.web3Public.getAllowance() method
     */
    public readonly providerGateway: string;

    public readonly type: OnChainTradeType = ON_CHAIN_TRADE_TYPE.RANGO;

    private readonly _toTokenAmountMin: PriceTokenAmount;

    public get toTokenAmountMin(): PriceTokenAmount {
        return this._toTokenAmountMin;
    }

    protected get spenderAddress(): string {
        return this.useProxy
            ? rubicProxyContractAddress[this.from.blockchain].gateway
            : this.providerGateway;
    }

    public get dexContractAddress(): string {
        throw new RubicSdkError('Dex address is unknown before swap is started');
    }

    constructor(
        tradeStruct: RangoOnChainTradeStruct,
        providerAddress: string,
        providerGateway: string
    ) {
        super(tradeStruct, providerAddress);

        this._toTokenAmountMin = new PriceTokenAmount({
            ...this.to.asStruct,
            weiAmount: tradeStruct.toTokenWeiAmountMin
        });

        this.providerGateway = providerGateway;
    }

    protected async getTransactionConfigAndAmount(
        options: EncodeTransactionOptions
    ): Promise<EvmEncodedConfigAndToAmount> {
        const params = await RangoCommonParser.getSwapQueryParams(this.fromWithoutFee, this.to, {
            slippageTolerance: this.slippageTolerance,
            receiverAddress: options.receiverAddress || this.walletAddress,
            swapperGroups: RANGO_ON_CHAIN_DISABLED_PROVIDERS,
            fromAddress: this.walletAddress
        });

        const { tx: transaction, route } = await RangoOnChainApiService.getSwapTransaction(
            params,
            true
        );

        const { txData, txTo, value, gasLimit, gasPrice } = transaction as RangoTransaction;

        const { outputAmount: toAmount } = route as RangoBestRouteSimulationResult;

        return {
            tx: {
                data: txData!,
                to: txTo!,
                value: value || '0',
                gas: gasLimit ?? undefined,
                gasPrice: gasPrice ?? undefined
            },
            toAmount
        };
    }
}
