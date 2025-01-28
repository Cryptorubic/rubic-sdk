import { RubicSdkError, SwapRequestError } from 'src/common/errors';
import { UpdatedRatesError } from 'src/common/errors/cross-chain/updated-rates-error';
import { PriceTokenAmount } from 'src/common/tokens';
import { EvmEncodeConfig } from 'src/core/blockchain/web3-pure/typed-web3-pure/evm-web3-pure/models/evm-encode-config';
import { EncodeTransactionOptions } from 'src/features/common/models/encode-transaction-options';
import { getSolanaFee } from 'src/features/common/utils/get-solana-fee';
import { rubicProxyContractAddress } from 'src/features/cross-chain/calculation-manager/providers/common/constants/rubic-proxy-contract-address';
import { Route } from 'src/features/cross-chain/calculation-manager/providers/lifi-provider/models/lifi-route';

import { OnChainTradeType } from '../../../common/models/on-chain-trade-type';
import { AggregatorSolanaOnChainTrade } from '../../../common/on-chain-aggregator/aggregator-solana-on-chain-trade-abstract';
import { EvmEncodedConfigAndToAmount } from '../../../common/on-chain-aggregator/models/aggregator-on-chain-types';
import { LifiOnChainTransactionRequest } from '../models/lifi-on-chain-transaction-request';
import { LifiSolanaOnChainTradeStruct } from '../models/lifi-trade-struct';
import { LifiOnChainApiService } from '../services/lifi-on-chain-api-service';

export class LifiSolanaOnChainTrade extends AggregatorSolanaOnChainTrade {
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

    constructor(tradeStruct: LifiSolanaOnChainTradeStruct, providerAddress: string) {
        super(tradeStruct, providerAddress);

        this._toTokenAmountMin = new PriceTokenAmount({
            ...this.to.asStruct,
            weiAmount: tradeStruct.toTokenWeiAmountMin
        });
        this.type = tradeStruct.type;
        this.route = tradeStruct.route;
        this.providerGateway = this.route.steps[0]!.estimate.approvalAddress;
    }

    public async encodeDirect(options: EncodeTransactionOptions): Promise<EvmEncodeConfig> {
        await this.checkFromAddress(options.fromAddress, true);

        try {
            const transactionData = await this.getTxConfigAndCheckAmount(
                options.receiverAddress,
                options.fromAddress,
                options.skipAmountCheck
            );

            return {
                data: transactionData.data,
                to: '',
                value: ''
            };
        } catch (err) {
            if ([400, 500, 503].includes(err.code)) {
                throw new SwapRequestError();
            }

            if (err instanceof UpdatedRatesError || err instanceof RubicSdkError) {
                throw err;
            }
            throw new RubicSdkError('Can not encode trade');
        }
    }

    protected async getToAmountAndTxData(
        receiverAddress?: string | undefined,
        fromAddress?: string | undefined
    ): Promise<EvmEncodedConfigAndToAmount> {
        const firstStep = this.route.steps[0]!;
        const step = {
            ...firstStep,
            action: {
                ...firstStep.action,
                fromAddress: fromAddress || this.walletAddress,
                toAddress: receiverAddress || this.walletAddress
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
            const rubicFee = getSolanaFee(this.from);
            const swapResponse: {
                transactionRequest: LifiOnChainTransactionRequest;
                estimate: Route;
            } = await LifiOnChainApiService.getQuote(
                step.action.fromChainId,
                step.action.toChainId,
                step.action.fromToken.address,
                step.action.toToken.address,
                this.from.stringWeiAmount,
                step.action.fromAddress,
                step.action.slippage,
                rubicFee ? rubicFee : undefined
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
