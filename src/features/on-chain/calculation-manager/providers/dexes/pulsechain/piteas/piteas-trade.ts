import BigNumber from 'bignumber.js';
import { EvmEncodeConfig } from 'src/core/blockchain/web3-pure/typed-web3-pure/evm-web3-pure/models/evm-encode-config';
import { Injector } from 'src/core/injector/injector';
import { EncodeTransactionOptions } from 'src/features/common/models/encode-transaction-options';
import {
    ON_CHAIN_TRADE_TYPE,
    OnChainTradeType
} from 'src/features/on-chain/calculation-manager/providers/common/models/on-chain-trade-type';
import { EvmOnChainTrade } from 'src/features/on-chain/calculation-manager/providers/common/on-chain-trade/evm-on-chain-trade/evm-on-chain-trade';
import { EvmOnChainTradeStruct } from 'src/features/on-chain/calculation-manager/providers/common/on-chain-trade/evm-on-chain-trade/models/evm-on-chain-trade-struct';
import {
    PiteasMethodParameters,
    PiteasQuoteRequestParams,
    PiteasSuccessQuoteResponse
} from 'src/features/on-chain/calculation-manager/providers/dexes/pulsechain/piteas/models/piteas-quote';

export class PiteasTrade extends EvmOnChainTrade {
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

    private readonly methodParameters: PiteasMethodParameters;

    private readonly quoteRequestParams: PiteasQuoteRequestParams;

    constructor(
        tradeStruct: EvmOnChainTradeStruct,
        providerAddress: string,
        methodParameters: PiteasMethodParameters,
        quoteRequestParams: PiteasQuoteRequestParams
    ) {
        super(tradeStruct, providerAddress);

        this.dexContractAddress = '0x6BF228eb7F8ad948d37deD07E595EfddfaAF88A6';
        this.methodParameters = methodParameters;
        this.quoteRequestParams = quoteRequestParams;
    }

    public async encodeDirect(options: EncodeTransactionOptions): Promise<EvmEncodeConfig> {
        await this.checkFromAddress(options.fromAddress, true);
        await this.checkReceiverAddress(options.receiverAddress);

        const { destAmount, methodParameters } =
            await this.httpClient.get<PiteasSuccessQuoteResponse>('https://api.piteas.io/quote', {
                params: {
                    ...this.quoteRequestParams,
                    ...(options?.receiverAddress && { account: options?.receiverAddress })
                }
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
