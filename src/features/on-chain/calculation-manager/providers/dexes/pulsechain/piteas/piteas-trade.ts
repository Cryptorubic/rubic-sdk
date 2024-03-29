import BigNumber from 'bignumber.js';
import { EvmEncodeConfig } from 'src/core/blockchain/web3-pure/typed-web3-pure/evm-web3-pure/models/evm-encode-config';
import { Injector } from 'src/core/injector/injector';
import { EncodeTransactionOptions } from 'src/features/common/models/encode-transaction-options';
import {
    ON_CHAIN_TRADE_TYPE,
    OnChainTradeType
} from 'src/features/on-chain/calculation-manager/providers/common/models/on-chain-trade-type';
import { AggregatorEvmOnChainTrade } from 'src/features/on-chain/calculation-manager/providers/common/on-chain-aggregator/aggregator-evm-on-chain-trade-abstract';
import { EvmOnChainTradeStruct } from 'src/features/on-chain/calculation-manager/providers/common/on-chain-trade/evm-on-chain-trade/models/evm-on-chain-trade-struct';
import {
    PiteasMethodParameters,
    PiteasQuoteRequestParams
} from 'src/features/on-chain/calculation-manager/providers/dexes/pulsechain/piteas/models/piteas-quote';
import { PiteasApiService } from 'src/features/on-chain/calculation-manager/providers/dexes/pulsechain/piteas/piteas-api-service';

import { GetToAmountAndTxDataResponse } from '../../../common/on-chain-aggregator/models/aggregator-on-chain-types';

export class PiteasTrade extends AggregatorEvmOnChainTrade {
    protected getToAmountAndTxData(): Promise<GetToAmountAndTxDataResponse> {
        throw new Error('Method not implemented.');
    }

    public static async getGasLimit(
        tradeStruct: EvmOnChainTradeStruct,
        methodParameters: PiteasMethodParameters
    ): Promise<BigNumber | null> {
        const fromBlockchain = tradeStruct.from.blockchain;
        const walletAddress =
            Injector.web3PrivateService.getWeb3PrivateByBlockchain(fromBlockchain).address;
        if (!walletAddress) {
            return null;
        }

        try {
            const web3Public = Injector.web3PublicService.getWeb3Public(fromBlockchain);
            const gasLimit = await web3Public.getEstimatedGasByData(
                walletAddress,
                '0x6BF228eb7F8ad948d37deD07E595EfddfaAF88A6',
                {
                    data: methodParameters.calldata,
                    value: methodParameters.value
                }
            );

            if (!gasLimit?.isFinite()) {
                return null;
            }
            return gasLimit;
        } catch (err) {
            console.debug(err);
            return null;
        }
    }

    public get type(): OnChainTradeType {
        return ON_CHAIN_TRADE_TYPE.PITEAS;
    }

    public readonly dexContractAddress: string;

    private readonly quoteRequestParams: PiteasQuoteRequestParams;

    constructor(
        tradeStruct: EvmOnChainTradeStruct,
        providerAddress: string,
        quoteRequestParams: PiteasQuoteRequestParams
    ) {
        super(tradeStruct, providerAddress);

        this.dexContractAddress = '0x6BF228eb7F8ad948d37deD07E595EfddfaAF88A6';
        this.quoteRequestParams = quoteRequestParams;
    }

    public async encodeDirect(options: EncodeTransactionOptions): Promise<EvmEncodeConfig> {
        await this.checkFromAddress(options.fromAddress, true);
        await this.checkReceiverAddress(options.receiverAddress);

        const { destAmount, methodParameters } = await PiteasApiService.fetchQuote({
            ...this.quoteRequestParams,
            ...(options?.receiverAddress && { account: options?.receiverAddress })
        });

        this.checkAmountChange(
            {
                to: this.dexContractAddress,
                data: methodParameters.calldata,
                value: methodParameters.value
            },
            destAmount,
            this.to.stringWeiAmount
        );

        return {
            to: this.dexContractAddress,
            data: methodParameters.calldata,
            value: methodParameters.value
        };
    }
}
