import { RubicSdkError } from 'src/common/errors';
import { UpdatedRatesError } from 'src/common/errors/cross-chain/updated-rates-error';
import { PriceTokenAmount } from 'src/common/tokens';
import { SuiBlockchainName } from 'src/core/blockchain/models/blockchain-name';
import { SuiEncodeConfig } from 'src/core/blockchain/web3-pure/typed-web3-pure/sui-web3-pure/sui-encode-config';
import { EncodeTransactionOptions } from 'src/features/common/models/encode-transaction-options';
import { OpenOceanApiService } from 'src/features/on-chain/calculation-manager/providers/aggregators/open-ocean/services/open-ocean-api-service';
import { ON_CHAIN_TRADE_TYPE } from 'src/features/on-chain/calculation-manager/providers/common/models/on-chain-trade-type';
import { AggregatorSuiOnChainTrade } from 'src/features/on-chain/calculation-manager/providers/common/on-chain-aggregator/aggregator-sui-on-chain-trade-abstract';
import { SuiEncodedConfigAndToAmount } from 'src/features/on-chain/calculation-manager/providers/common/on-chain-aggregator/models/aggregator-on-chain-types';
import { SuiOnChainTradeStruct } from 'src/features/on-chain/calculation-manager/providers/common/on-chain-trade/sui-on-chain-trade/models/sui-on-chain-trade-struct';

export class OpenOceanSuiTrade extends AggregatorSuiOnChainTrade {
    public readonly type = ON_CHAIN_TRADE_TYPE.OPEN_OCEAN;

    protected get spenderAddress(): string {
        throw new Error('Not implemented');
    }

    public get dexContractAddress(): string {
        throw new RubicSdkError('Dex address is unknown before swap is started');
    }

    constructor(tradeStruct: SuiOnChainTradeStruct, providerAddress: string) {
        super(tradeStruct, providerAddress);
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
        receiverAddress?: string,
        fromAddress?: string
    ): Promise<SuiEncodedConfigAndToAmount> {
        const swapQuoteResponse = await OpenOceanApiService.fetchSuiSwapData(
            this.fromWithoutFee as PriceTokenAmount<SuiBlockchainName>,
            this.to,
            receiverAddress || fromAddress || this.walletAddress,
            this.slippageTolerance
        );
        const tx = swapQuoteResponse.data;
        return { tx: { transaction: tx.data }, toAmount: tx.outAmount };
    }
}
