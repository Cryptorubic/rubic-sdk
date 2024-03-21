import BigNumber from 'bignumber.js';
import {
    LowSlippageDeflationaryTokenError,
    RubicSdkError,
    SwapRequestError
} from 'src/common/errors';
import { PriceTokenAmount } from 'src/common/tokens';
import { parseError } from 'src/common/utils/errors';
import { EvmWeb3Pure } from 'src/core/blockchain/web3-pure/typed-web3-pure/evm-web3-pure/evm-web3-pure';
import { EvmEncodeConfig } from 'src/core/blockchain/web3-pure/typed-web3-pure/evm-web3-pure/models/evm-encode-config';
import { EncodeTransactionOptions } from 'src/features/common/models/encode-transaction-options';
import { RangoBestRouteSimulationResult } from 'src/features/common/providers/rango/models/rango-api-best-route-types';
import { RangoCommonParser } from 'src/features/common/providers/rango/services/rango-parser';
import { rubicProxyContractAddress } from 'src/features/cross-chain/calculation-manager/providers/common/constants/rubic-proxy-contract-address';
import { getOnChainGasData } from 'src/features/on-chain/calculation-manager/utils/get-on-chain-gas-data';

import { ON_CHAIN_TRADE_TYPE, OnChainTradeType } from '../../common/models/on-chain-trade-type';
import { AggregatorEvmOnChainTrade } from '../../common/on-chain-aggregator/aggregator-evm-on-chain-trade-abstract';
import { GetToAmountAndTxDataResponse } from '../../common/on-chain-aggregator/models/aggregator-on-chain-types';
import { rangoOnChainDisabledProviders } from './models/rango-on-chain-disabled-providers';
import { RangoOnChainTradeStruct } from './models/rango-on-chain-trade-types';
import { RangoOnChainApiService } from './services/rango-on-chain-api-service';

export class RangoOnChainTrade extends AggregatorEvmOnChainTrade {
    /* @internal */
    public static async getGasLimit(
        tradeStruct: RangoOnChainTradeStruct,
        providerGateway: string
    ): Promise<BigNumber | null> {
        const rangoTrade = new RangoOnChainTrade(
            tradeStruct,
            EvmWeb3Pure.EMPTY_ADDRESS,
            providerGateway
        );

        return getOnChainGasData(rangoTrade);
    }

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

    public async encodeDirect(options: EncodeTransactionOptions): Promise<EvmEncodeConfig> {
        await this.checkFromAddress(options.fromAddress, true);
        await this.checkReceiverAddress(options.receiverAddress);

        try {
            const transactionData = await this.getTxConfigAndCheckAmount(
                false,
                options?.useCacheData || false,
                options.receiverAddress,
                options.fromAddress
            );

            const { gas, gasPrice } = this.getGasParams(options, {
                gasLimit: transactionData.gas,
                gasPrice: transactionData.gasPrice
            });

            return {
                to: transactionData.to,
                data: transactionData.data,
                value: this.fromWithoutFee.isNative ? this.fromWithoutFee.stringWeiAmount : '0',
                gas,
                gasPrice
            };
        } catch (err) {
            if ([400, 500, 503].includes(err.code)) {
                throw new SwapRequestError();
            }
            if (this.isDeflationError()) {
                throw new LowSlippageDeflationaryTokenError();
            }
            throw parseError(err);
        }
    }

    protected async getTransactionConfigAndAmount(
        receiverAddress?: string,
        fromAddress?: string
    ): Promise<GetToAmountAndTxDataResponse> {
        const params = await RangoCommonParser.getSwapQueryParams(this.from, this.to, {
            slippageTolerance: this.slippageTolerance,
            receiverAddress: receiverAddress || this.walletAddress,
            swapperGroups: rangoOnChainDisabledProviders,
            fromAddress
        });

        const { tx: transaction, route } = await RangoOnChainApiService.getSwapTransaction(params);

        const { outputAmount: toAmount } = route as RangoBestRouteSimulationResult;

        return {
            tx: {
                data: transaction!.txData!,
                to: transaction!.txTo!,
                value: transaction!.value!,
                gas: transaction!.gasLimit ?? undefined,
                gasPrice: transaction!.gasPrice ?? undefined
            },
            toAmount
        };
    }
}
