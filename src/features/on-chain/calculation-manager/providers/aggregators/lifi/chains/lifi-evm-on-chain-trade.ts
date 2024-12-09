import {
    LifiPairIsUnavailableError,
    LowSlippageDeflationaryTokenError,
    RubicSdkError,
    SwapRequestError
} from 'src/common/errors';
import { UpdatedRatesError } from 'src/common/errors/cross-chain/updated-rates-error';
import { PriceTokenAmount } from 'src/common/tokens/price-token-amount';
import { EncodeTransactionOptions } from 'src/features/common/models/encode-transaction-options';
import { rubicProxyContractAddress } from 'src/features/cross-chain/calculation-manager/providers/common/constants/rubic-proxy-contract-address';
import { Route } from 'src/features/cross-chain/calculation-manager/providers/lifi-provider/models/lifi-route';
import { LifiEvmOnChainTradeStruct } from 'src/features/on-chain/calculation-manager/providers/aggregators/lifi/models/lifi-trade-struct';
import { OnChainTradeType } from 'src/features/on-chain/calculation-manager/providers/common/models/on-chain-trade-type';

import { AggregatorEvmOnChainTrade } from '../../../common/on-chain-aggregator/aggregator-evm-on-chain-trade-abstract';
import { EvmEncodedConfigAndToAmount } from '../../../common/on-chain-aggregator/models/aggregator-on-chain-types';
import { LifiOnChainTransactionRequest } from '../models/lifi-on-chain-transaction-request';
import { LifiOnChainApiService } from '../services/lifi-on-chain-api-service';

export class LifiEvmOnChainTrade extends AggregatorEvmOnChainTrade {
    public readonly providerGateway: string;

    public readonly type: OnChainTradeType;

    private readonly route: Route;

    private readonly _toTokenAmountMin: PriceTokenAmount;

    protected get spenderAddress(): string {
        return this.useProxy
            ? rubicProxyContractAddress[this.from.blockchain].gateway
            : this.providerGateway;
    }

    public get dexContractAddress(): string {
        throw new RubicSdkError('Dex address is unknown before swap is started');
    }

    public get toTokenAmountMin(): PriceTokenAmount {
        return this._toTokenAmountMin;
    }

    constructor(tradeStruct: LifiEvmOnChainTradeStruct, providerAddress: string) {
        super(tradeStruct, providerAddress);

        this._toTokenAmountMin = new PriceTokenAmount({
            ...this.to.asStruct,
            weiAmount: tradeStruct.toTokenWeiAmountMin
        });
        this.type = tradeStruct.type;
        this.route = tradeStruct.route;
        this.providerGateway = this.route.steps[0]!.estimate.approvalAddress;
    }

    protected getSwapError(err: unknown & { code: number }): Error {
        if ('code' in err && [400, 500, 503].includes(err.code)) {
            throw new SwapRequestError();
        }
        if (this.isDeflationError()) {
            throw new LowSlippageDeflationaryTokenError();
        }
        if (err instanceof UpdatedRatesError || err instanceof RubicSdkError) {
            throw err;
        }
        throw new LifiPairIsUnavailableError();
    }

    protected async getTransactionConfigAndAmount(
        options: EncodeTransactionOptions
    ): Promise<EvmEncodedConfigAndToAmount> {
        const firstStep = this.route.steps[0]!;
        const step = {
            ...firstStep,
            action: {
                ...firstStep.action,
                fromAddress: options.fromAddress || this.walletAddress,
                toAddress: options.receiverAddress || this.walletAddress
            },
            execution: {
                status: 'NOT_STARTED',
                process: [
                    {
                        message: 'Preparing swap.',
                        startedAt: Date.now(),
                        status: 'STARTED',
                        type: 'SWAP'
                    }
                ]
            }
        };

        try {
            const swapResponse: {
                transactionRequest: LifiOnChainTransactionRequest;
                estimate: Route;
            } = await LifiOnChainApiService.getQuote(
                step.action.fromChainId,
                step.action.toChainId,
                step.action.fromToken.address,
                step.action.toToken.address,
                step.action.fromAmount,
                step.action.fromAddress,
                step.action.slippage
            );

            const {
                transactionRequest,
                estimate: { toAmount }
            } = swapResponse;

            return {
                tx: {
                    data: transactionRequest.data,
                    to: transactionRequest.to,
                    value: transactionRequest.value,
                    gas: transactionRequest.gasLimit,
                    gasPrice: transactionRequest.gasPrice
                },
                toAmount
            };
        } catch (err) {
            if ('statusCode' in err && 'message' in err) {
                throw new RubicSdkError(err.message);
            }
            throw err;
        }
    }
}
