import { EvmOnChainTradeStruct } from 'src/features/on-chain/calculation-manager/providers/common/on-chain-trade/evm-on-chain-trade/models/evm-on-chain-trade-struct';

export interface IzumiTradeStruct extends EvmOnChainTradeStruct {
    readonly dexContractAddress: string;
    readonly swapConfig: {
        readonly tokenChain: string[];
        readonly feeChain: number[];
    };
    readonly strictERC20Token: boolean;
}
