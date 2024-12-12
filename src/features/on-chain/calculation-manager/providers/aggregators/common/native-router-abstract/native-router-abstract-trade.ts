import { RubicSdkError } from 'src/common/errors';
import { EvmEncodeConfig } from 'src/core/blockchain/web3-pure/typed-web3-pure/evm-web3-pure/models/evm-encode-config';
import { EncodeTransactionOptions } from 'src/features/common/models/encode-transaction-options';
import { checkUnsupportedReceiverAddress } from 'src/features/common/utils/check-unsupported-receiver-address';
import { rubicProxyContractAddress } from 'src/features/cross-chain/calculation-manager/providers/common/constants/rubic-proxy-contract-address';

import { AggregatorEvmOnChainTrade } from '../../../common/on-chain-aggregator/aggregator-evm-on-chain-trade-abstract';
import { EvmEncodedConfigAndToAmount } from '../../../common/on-chain-aggregator/models/aggregator-on-chain-types';
import { NativeRouterQuoteRequestParams } from './models/native-router-quote';
import { NativeRouterTradeInstance } from './models/native-router-trade-struct';
import { NativeRouterApiService } from './services/native-router-api-service';

export abstract class NativeRouterAbstractTrade extends AggregatorEvmOnChainTrade {
    public readonly providerGateway: string;

    private readonly nativeRouterQuoteParams: NativeRouterQuoteRequestParams;

    protected get spenderAddress(): string {
        return this.useProxy
            ? rubicProxyContractAddress[this.from.blockchain].gateway
            : this.providerGateway;
    }

    public get dexContractAddress(): string {
        throw new RubicSdkError('Dex address is unknown before swap is started');
    }

    constructor(tradeInstance: NativeRouterTradeInstance) {
        super(tradeInstance.tradeStruct, tradeInstance.providerAddress);
        this.providerGateway = tradeInstance.providerGateway;
        this.nativeRouterQuoteParams = tradeInstance.nativeRouterQuoteParams;
    }

    public async encode(options: EncodeTransactionOptions): Promise<EvmEncodeConfig> {
        await checkUnsupportedReceiverAddress(options.receiverAddress, this.walletAddress);
        await this.checkFromAddress(options.fromAddress, true);
        await this.checkReceiverAddress(options.receiverAddress);

        if (this.useProxy) {
            return this.encodeProxy(options);
        }
        return this.encodeDirect(options);
    }

    protected async getTransactionConfigAndAmount(
        options: EncodeTransactionOptions
    ): Promise<EvmEncodedConfigAndToAmount> {
        const account = options.receiverAddress || options.fromAddress;
        try {
            const { amountOut, txRequest } = await NativeRouterApiService.getFirmQuote({
                ...this.nativeRouterQuoteParams,
                from_address: account
            });

            const tx: EvmEncodeConfig = {
                to: txRequest.target,
                data: txRequest.calldata,
                value: txRequest.value
            };

            return {
                tx,
                toAmount: amountOut
            };
        } catch (err) {
            if ('statusCode' in err && 'message' in err) {
                throw new RubicSdkError(err.message);
            }
            throw err;
        }
    }
}
