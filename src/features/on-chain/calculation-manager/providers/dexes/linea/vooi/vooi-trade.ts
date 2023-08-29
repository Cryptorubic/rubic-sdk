import { EvmWeb3Pure } from 'src/core/blockchain/web3-pure/typed-web3-pure/evm-web3-pure/evm-web3-pure';
import { EvmEncodeConfig } from 'src/core/blockchain/web3-pure/typed-web3-pure/evm-web3-pure/models/evm-encode-config';
import { EncodeTransactionOptions } from 'src/features/common/models/encode-transaction-options';
import {
    ON_CHAIN_TRADE_TYPE,
    OnChainTradeType
} from 'src/features/on-chain/calculation-manager/providers/common/models/on-chain-trade-type';
import { EvmOnChainTrade } from 'src/features/on-chain/calculation-manager/providers/common/on-chain-trade/evm-on-chain-trade/evm-on-chain-trade';
import { vooiAbi } from 'src/features/on-chain/calculation-manager/providers/dexes/linea/vooi/constants/vooi-abi';
import { VooiTradeStruct } from 'src/features/on-chain/calculation-manager/providers/dexes/linea/vooi/models/vooi-trade-struct';

export class VooiTrade extends EvmOnChainTrade {
    private fromPoolId: number;

    private toPoolId: number;

    private deadline: number;

    public static get type(): OnChainTradeType {
        return ON_CHAIN_TRADE_TYPE.VOOI;
    }

    public readonly type = ON_CHAIN_TRADE_TYPE.VOOI;

    public readonly dexContractAddress = '0xBc7f67fA9C72f9fcCf917cBCEe2a50dEb031462A';

    constructor(tradeStruct: VooiTradeStruct, providerAddress: string) {
        super(tradeStruct, providerAddress);
        this.fromPoolId = tradeStruct.fromPoolId;
        this.toPoolId = tradeStruct.toPoolId;
        this.deadline = tradeStruct.deadlineMinutes;
    }

    public async encodeDirect(options: EncodeTransactionOptions): Promise<EvmEncodeConfig> {
        await this.checkFromAddress(options.fromAddress, true);
        await this.checkReceiverAddress(options.receiverAddress);
        const receiver = options?.receiverAddress || this.walletAddress;

        const gasParams = this.getGasParams(options);

        return EvmWeb3Pure.encodeMethodCall(
            this.dexContractAddress,
            vooiAbi,
            'swap',
            [
                this.fromPoolId,
                this.toPoolId,
                this.from.stringWeiAmount,
                this.toTokenAmountMin.stringWeiAmount,
                receiver,
                this.deadline
            ],
            this.fromWithoutFee.isNative ? this.fromWithoutFee.stringWeiAmount : '0',
            gasParams
        );
    }
}
