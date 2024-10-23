import { deadlineMinutesTimestamp } from 'src/common/utils/options';
import { EvmWeb3Pure } from 'src/core/blockchain/web3-pure/typed-web3-pure/evm-web3-pure/evm-web3-pure';
import { EncodeTransactionOptions } from 'src/features/common/models/encode-transaction-options';
import {
    ON_CHAIN_TRADE_TYPE,
    OnChainTradeType
} from 'src/features/on-chain/calculation-manager/providers/common/models/on-chain-trade-type';
import { EvmEncodedConfigAndToAmount } from 'src/features/on-chain/calculation-manager/providers/common/on-chain-aggregator/models/aggregator-on-chain-types';
import { EvmOnChainTrade } from 'src/features/on-chain/calculation-manager/providers/common/on-chain-trade/evm-on-chain-trade/evm-on-chain-trade';

import { vooiAbi } from './constants/vooi-abi';
import { VooiTradeStruct } from './models/vooi-trade-struct';

export abstract class VooiAbstractTrade extends EvmOnChainTrade {
    private fromPoolId: number;

    private toPoolId: number;

    private deadlineInMinutes: number;

    public static get type(): OnChainTradeType {
        return ON_CHAIN_TRADE_TYPE.VOOI;
    }

    public readonly type = ON_CHAIN_TRADE_TYPE.VOOI;

    public abstract readonly dexContractAddress: string;

    constructor(tradeStruct: VooiTradeStruct, providerAddress: string) {
        super(tradeStruct, providerAddress);
        this.fromPoolId = tradeStruct.fromPoolId;
        this.toPoolId = tradeStruct.toPoolId;
        this.deadlineInMinutes = tradeStruct.deadlineMinutes;
    }

    protected async getTransactionConfigAndAmount(
        options: EncodeTransactionOptions
    ): Promise<EvmEncodedConfigAndToAmount> {
        await this.checkFromAddress(options.fromAddress, true);
        await this.checkReceiverAddress(options.receiverAddress);
        const receiver = options?.receiverAddress || this.walletAddress;

        const gasParams = this.getGasParams(options);

        const config = EvmWeb3Pure.encodeMethodCall(
            this.dexContractAddress,
            vooiAbi,
            'swap',
            [
                this.fromPoolId,
                this.toPoolId,
                this.fromWithoutFee.stringWeiAmount,
                this.toTokenAmountMin.stringWeiAmount,
                receiver,
                deadlineMinutesTimestamp(this.deadlineInMinutes)
            ],
            this.fromWithoutFee.isNative ? this.fromWithoutFee.stringWeiAmount : '0',
            gasParams
        );

        return { tx: config, toAmount: this.to.stringWeiAmount };
    }
}
