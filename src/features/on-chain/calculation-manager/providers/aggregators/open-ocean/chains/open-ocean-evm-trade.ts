import { NotWhitelistedProviderError, RubicSdkError } from 'src/common/errors';
import { PriceTokenAmount } from 'src/common/tokens/price-token-amount';
import { BLOCKCHAIN_NAME } from 'src/core/blockchain/models/blockchain-name';
import { EncodeTransactionOptions } from 'src/features/common/models/encode-transaction-options';
import { rubicProxyContractAddress } from 'src/features/cross-chain/calculation-manager/providers/common/constants/rubic-proxy-contract-address';
import { GetContractParamsOptions } from 'src/features/cross-chain/calculation-manager/providers/common/models/get-contract-params-options';
import { ProxyCrossChainEvmTrade } from 'src/features/cross-chain/calculation-manager/providers/common/proxy-cross-chain-evm-facade/proxy-cross-chain-evm-trade';
import { OpenoceanOnChainSupportedBlockchain } from 'src/features/on-chain/calculation-manager/providers/aggregators/open-ocean/constants/open-ocean-on-chain-supported-blockchain';
import { OpenOceanTradeStruct } from 'src/features/on-chain/calculation-manager/providers/aggregators/open-ocean/models/open-ocean-trade-struct';
import { ON_CHAIN_TRADE_TYPE } from 'src/features/on-chain/calculation-manager/providers/common/models/on-chain-trade-type';

import { AggregatorEvmOnChainTrade } from '../../../common/on-chain-aggregator/aggregator-evm-on-chain-trade-abstract';
import { EvmEncodedConfigAndToAmount } from '../../../common/on-chain-aggregator/models/aggregator-on-chain-types';
import { OpenOceanApiService } from '../services/open-ocean-api-service';

export class OpenOceanEvmTrade extends AggregatorEvmOnChainTrade {
    public readonly type = ON_CHAIN_TRADE_TYPE.OPEN_OCEAN;

    protected get spenderAddress(): string {
        const openOceanContractAddress =
            this.from.blockchain === BLOCKCHAIN_NAME.OKE_X_CHAIN
                ? '0xc0006Be82337585481044a7d11941c0828FFD2D4'
                : '0x6352a56caadC4F1E25CD6c75970Fa768A3304e64';

        return this.useProxy
            ? rubicProxyContractAddress[this.from.blockchain].gateway
            : openOceanContractAddress;
    }

    public get dexContractAddress(): string {
        throw new RubicSdkError('Dex address is unknown before swap is started');
    }

    constructor(tradeStruct: OpenOceanTradeStruct, providerAddress: string) {
        super(tradeStruct, providerAddress);
    }

    protected async getTransactionConfigAndAmount(
        options: EncodeTransactionOptions
    ): Promise<EvmEncodedConfigAndToAmount> {
        const swapQuoteResponse = await OpenOceanApiService.fetchSwapData(
            this.fromWithoutFee as PriceTokenAmount<OpenoceanOnChainSupportedBlockchain>,
            this.to,
            options.receiverAddress || options.fromAddress,
            this.slippageTolerance
        );
        const { data, to, value, outAmount: toAmount } = swapQuoteResponse.data;

        return {
            tx: {
                data,
                to,
                value
            },
            toAmount
        };
    }

    protected async getSwapData(options: GetContractParamsOptions): Promise<unknown[]> {
        const directTransactionConfig = await this.encodeDirect({
            ...options,
            fromAddress: rubicProxyContractAddress[this.from.blockchain].router,
            supportFee: false,
            receiverAddress: rubicProxyContractAddress[this.from.blockchain].router
        });
        const availableDexs = (
            await ProxyCrossChainEvmTrade.getWhitelistedDexes(this.from.blockchain)
        ).map(address => address.toLowerCase());

        const routerAddress = directTransactionConfig.to;
        const method = directTransactionConfig.data.slice(0, 10);

        if (!availableDexs.includes(routerAddress.toLowerCase())) {
            throw new NotWhitelistedProviderError(routerAddress, undefined, 'dex');
        }
        await ProxyCrossChainEvmTrade.checkDexWhiteList(
            this.from.blockchain,
            routerAddress,
            method
        );

        return [
            [
                routerAddress,
                routerAddress,
                this.from.isNative && this.from.blockchain === BLOCKCHAIN_NAME.METIS
                    ? '0xdeaddeaddeaddeaddeaddeaddeaddeaddead0000'
                    : this.from.address,
                this.to.address,
                this.from.stringWeiAmount,
                directTransactionConfig.data,
                true
            ]
        ];
    }
}
