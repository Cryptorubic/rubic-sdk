import { AggregatorResult, TransactionUtil } from '@cetusprotocol/cetus-sui-clmm-sdk';
import { RubicSdkError } from 'src/common/errors';
import { UpdatedRatesError } from 'src/common/errors/cross-chain/updated-rates-error';
import { Any } from 'src/common/utils/types';
import { SuiEncodeConfig } from 'src/core/blockchain/web3-pure/typed-web3-pure/sui-web3-pure/sui-encode-config';
import { EncodeTransactionOptions } from 'src/features/common/models/encode-transaction-options';
import { CetusProvider } from 'src/features/on-chain/calculation-manager/providers/aggregators/cetus/cetus-provider';
import { CetusTradeStruct } from 'src/features/on-chain/calculation-manager/providers/aggregators/cetus/models/cetus-trade-struct';
import { ON_CHAIN_TRADE_TYPE } from 'src/features/on-chain/calculation-manager/providers/common/models/on-chain-trade-type';
import { AggregatorSuiOnChainTrade } from 'src/features/on-chain/calculation-manager/providers/common/on-chain-aggregator/aggregator-sui-on-chain-trade-abstract';
import { SuiEncodedConfigAndToAmount } from 'src/features/on-chain/calculation-manager/providers/common/on-chain-aggregator/models/aggregator-on-chain-types';

export class CetusTrade extends AggregatorSuiOnChainTrade {
    public readonly type = ON_CHAIN_TRADE_TYPE.CETUS;

    private readonly quoteResult: AggregatorResult;

    protected get spenderAddress(): string {
        throw new Error('Not implemented');
    }

    public get dexContractAddress(): string {
        throw new RubicSdkError('Dex address is unknown before swap is started');
    }

    constructor(tradeStruct: CetusTradeStruct, providerAddress: string) {
        super(tradeStruct, providerAddress);
        this.quoteResult = tradeStruct.aggregatorResult;
    }

    public async encodeDirect(options: EncodeTransactionOptions): Promise<SuiEncodeConfig> {
        await this.checkFromAddress(options.fromAddress, true);

        try {
            const transactionData = await this.getTxConfigAndCheckAmount(
                options.receiverAddress,
                options.fromAddress,
                options.skipAmountCheck
            );

            return {
                transaction: transactionData.transaction
            };
        } catch (err) {
            if (err instanceof UpdatedRatesError || err instanceof RubicSdkError) {
                throw err;
            }
            throw new RubicSdkError('Can not encode trade');
        }
    }

    protected async getToAmountAndTxData(
        receiverAddress?: string | undefined,
        fromAddress?: string | undefined
    ): Promise<SuiEncodedConfigAndToAmount> {
        try {
            const allCoinAsset = await CetusProvider.swapSdk.getOwnerCoinAssets(fromAddress!);

            const [quoteRes, payload] = await Promise.all([
                CetusProvider.swapSdk.RouterV2.getBestRouter(
                    this.from.address,
                    this.to.address,
                    this.from.stringWeiAmount as Any,
                    true,
                    this.slippageTolerance,
                    '',
                    receiverAddress
                ),
                TransactionUtil.buildAggregatorSwapTransaction(
                    CetusProvider.swapSdk,
                    this.quoteResult,
                    allCoinAsset,
                    '',
                    this.slippageTolerance,
                    receiverAddress
                )
            ]);
            const transaction = await payload.toJSON();

            return {
                tx: { transaction },
                toAmount: String(quoteRes.result.outputAmount)
            };
        } catch (err) {
            if ('statusCode' in err && 'message' in err) {
                throw new RubicSdkError(err.message);
            }
            throw err;
        }
    }
}
