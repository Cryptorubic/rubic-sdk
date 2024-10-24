import { RubicSdkError } from 'src/common/errors';
import { EvmWeb3Pure } from 'src/core/blockchain/web3-pure/typed-web3-pure/evm-web3-pure/evm-web3-pure';
import { EncodeTransactionOptions } from 'src/features/common/models/encode-transaction-options';
import {
    ON_CHAIN_TRADE_TYPE,
    OnChainTradeType
} from 'src/features/on-chain/calculation-manager/providers/common/models/on-chain-trade-type';
import { EvmEncodedConfigAndToAmount } from 'src/features/on-chain/calculation-manager/providers/common/on-chain-aggregator/models/aggregator-on-chain-types';
import { EvmOnChainTrade } from 'src/features/on-chain/calculation-manager/providers/common/on-chain-trade/evm-on-chain-trade/evm-on-chain-trade';
import { registryExchangeAbi } from 'src/features/on-chain/calculation-manager/providers/dexes/common/curve-provider/constants/registry-exchange-abi';
import { CurveAbstractProvider } from 'src/features/on-chain/calculation-manager/providers/dexes/common/curve-provider/curve-abstract-provider';
import { CurveOnChainTradeStruct } from 'src/features/on-chain/calculation-manager/providers/dexes/common/curve-provider/models/curve-on-chain-trade-struct';

export abstract class CurveAbstractTrade extends EvmOnChainTrade {
    public get type(): OnChainTradeType {
        return ON_CHAIN_TRADE_TYPE.CURVE;
    }

    private get nativeValueToSend(): string | undefined {
        if (this.from.isNative) {
            return this.from.stringWeiAmount;
        }
        return '0';
    }

    public readonly dexContractAddress: string;

    private readonly poolAddress: string;

    constructor(tradeStruct: CurveOnChainTradeStruct, providerAddress: string) {
        super(tradeStruct, providerAddress);
        this.dexContractAddress = tradeStruct.registryExchangeAddress;
        this.poolAddress = tradeStruct.poolAddress;
    }

    protected async getTransactionConfigAndAmount(
        options: EncodeTransactionOptions
    ): Promise<EvmEncodedConfigAndToAmount> {
        await this.checkFromAddress(options.fromAddress, true);
        await this.checkReceiverAddress(options.receiverAddress);

        if (options.supportFee === undefined) {
            if (await this.needApprove(options.fromAddress)) {
                throw new RubicSdkError(
                    'To use `encode` function, token must be approved for wallet'
                );
            }

            try {
                await this.checkBalance();
            } catch (_err) {
                throw new RubicSdkError(
                    'To use `encode` function, wallet must have enough balance or you must provider `supportFee` parameter in options.'
                );
            }
        }
        const gasParams = this.getGasParams(options);
        const exchangeParams = [
            this.poolAddress,
            this.from.isNative ? CurveAbstractProvider.nativeAddress : this.from.address,
            this.to.isNative ? CurveAbstractProvider.nativeAddress : this.to.address,
            this.fromWithoutFee.stringWeiAmount,
            this.toTokenAmountMin.stringWeiAmount
        ];
        if (options.receiverAddress) {
            exchangeParams.push(options.receiverAddress);
        }

        const config = EvmWeb3Pure.encodeMethodCall(
            this.dexContractAddress,
            registryExchangeAbi,
            'exchange',
            exchangeParams,
            this.nativeValueToSend,
            gasParams
        );

        return { tx: config, toAmount: this.to.stringWeiAmount };
    }
}
