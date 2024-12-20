import { EncodeTransactionOptions } from 'src/features/common/models/encode-transaction-options';
import { checkUnsupportedReceiverAddress } from 'src/features/common/utils/check-unsupported-receiver-address';
import { ZeroXSupportedBlockchains } from 'src/features/on-chain/calculation-manager/providers/aggregators/zrx/constants/zrx-supported-blockchains';
import { ZrxQuoteRequest } from 'src/features/on-chain/calculation-manager/providers/aggregators/zrx/models/zrx-quote-request';
import { ZrxTradeStruct } from 'src/features/on-chain/calculation-manager/providers/aggregators/zrx/models/zrx-trade-struct';
import { ZrxApiService } from 'src/features/on-chain/calculation-manager/providers/aggregators/zrx/zrx-api-service';
import {
    ON_CHAIN_TRADE_TYPE,
    OnChainTradeType
} from 'src/features/on-chain/calculation-manager/providers/common/models/on-chain-trade-type';
import { AggregatorEvmOnChainTrade } from 'src/features/on-chain/calculation-manager/providers/common/on-chain-aggregator/aggregator-evm-on-chain-trade-abstract';
import { EvmEncodedConfigAndToAmount } from 'src/features/on-chain/calculation-manager/providers/common/on-chain-aggregator/models/aggregator-on-chain-types';

export class ZrxTrade extends AggregatorEvmOnChainTrade {
    private readonly affiliateAddress: string | undefined;

    public readonly dexContractAddress: string;

    public get type(): OnChainTradeType {
        return ON_CHAIN_TRADE_TYPE.ZRX;
    }

    constructor(tradeStruct: ZrxTradeStruct, providerAddress: string) {
        super(tradeStruct, providerAddress);
        this.affiliateAddress = tradeStruct.affiliateAddress;
        this.dexContractAddress = tradeStruct.routerAddress;
    }

    protected async getTransactionConfigAndAmount(
        options: EncodeTransactionOptions
    ): Promise<EvmEncodedConfigAndToAmount> {
        checkUnsupportedReceiverAddress(
            options?.receiverAddress,
            options?.fromAddress || this.walletAddress
        );

        const quoteParams: ZrxQuoteRequest = {
            params: {
                sellToken: this.from.address,
                buyToken: this.to.address,
                sellAmount: this.fromWithoutFee.stringWeiAmount,
                slippagePercentage: this.slippageTolerance.toString(),
                ...(this.affiliateAddress && { affiliateAddress: this.affiliateAddress })
            }
        };
        const tradeData = await ZrxApiService.getTradeData(
            quoteParams,
            this.from.blockchain as ZeroXSupportedBlockchains
        );

        const { gas, gasPrice } = this.getGasParams(options);
        const config = {
            to: tradeData.to,
            data: tradeData.data,
            value: tradeData.value,
            gas,
            gasPrice
        };

        return { tx: config, toAmount: tradeData.buyAmount };
    }
}
