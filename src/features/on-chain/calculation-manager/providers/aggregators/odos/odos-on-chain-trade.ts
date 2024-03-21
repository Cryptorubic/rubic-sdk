import BigNumber from 'bignumber.js';
import {
    LowSlippageDeflationaryTokenError,
    RubicSdkError,
    SwapRequestError
} from 'src/common/errors';
import { parseError } from 'src/common/utils/errors';
import { EvmWeb3Pure } from 'src/core/blockchain/web3-pure/typed-web3-pure/evm-web3-pure/evm-web3-pure';
import { EvmEncodeConfig } from 'src/core/blockchain/web3-pure/typed-web3-pure/evm-web3-pure/models/evm-encode-config';
import { EncodeTransactionOptions } from 'src/features/common/models/encode-transaction-options';
import { rubicProxyContractAddress } from 'src/features/cross-chain/calculation-manager/providers/common/constants/rubic-proxy-contract-address';
import { AggregatorEvmOnChainTrade } from 'src/features/on-chain/calculation-manager/providers/common/on-chain-aggregator/aggregator-evm-on-chain-trade-abstract';
import { getOnChainGasData } from 'src/features/on-chain/calculation-manager/utils/get-on-chain-gas-data';

import { ON_CHAIN_TRADE_TYPE } from '../../common/models/on-chain-trade-type';
import { GetToAmountAndTxDataResponse } from '../../common/on-chain-aggregator/models/aggregator-on-chain-types';
import { OdosBestRouteRequestBody } from './models/odos-api-best-route-types';
import { OdosOnChainTradeStruct } from './models/odos-on-chain-trade-types';
import { OdosOnChainApiService } from './services/odos-on-chain-api-service';

export class OdosOnChainTrade extends AggregatorEvmOnChainTrade {
    /* @internal */
    public static async getGasLimit(
        tradeStruct: OdosOnChainTradeStruct,
        providerGateway: string
    ): Promise<BigNumber | null> {
        const odosTrade = new OdosOnChainTrade(
            tradeStruct,
            EvmWeb3Pure.EMPTY_ADDRESS,
            providerGateway
        );

        return getOnChainGasData(odosTrade);
    }

    public readonly type = ON_CHAIN_TRADE_TYPE.ODOS;

    public readonly providerGateway: string;

    private bestRouteRequestBody: OdosBestRouteRequestBody;

    public get dexContractAddress(): string {
        throw new RubicSdkError('Dex address is unknown before swap is started');
    }

    protected get spenderAddress(): string {
        return this.useProxy
            ? rubicProxyContractAddress[this.from.blockchain].gateway
            : this.providerGateway;
    }

    constructor(
        tradeStruct: OdosOnChainTradeStruct,
        providerAddress: string,
        providerGateway: string
    ) {
        super(tradeStruct, providerAddress);
        this.bestRouteRequestBody = tradeStruct.bestRouteRequestBody;
        this.providerGateway = providerGateway;
    }

    public async encodeDirect(options: EncodeTransactionOptions): Promise<EvmEncodeConfig> {
        await this.checkFromAddress(options.fromAddress, true);
        await this.checkReceiverAddress(options.receiverAddress);

        try {
            const transactionData = await this.getTxConfigAndCheckAmount(
                false,
                options.useCacheData || false,
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
        receiverAddress?: string
    ): Promise<GetToAmountAndTxDataResponse> {
        const { pathId } = await OdosOnChainApiService.getBestRoute(this.bestRouteRequestBody);

        const { transaction, outputTokens } = await OdosOnChainApiService.getSwapTx({
            userAddr: this.walletAddress,
            receiver: receiverAddress,
            pathId
        });

        const toAmount = outputTokens[0]!.amount;

        return {
            tx: {
                data: transaction!.data,
                to: transaction!.to,
                value: transaction!.value
            },
            toAmount
        };
    }
}
