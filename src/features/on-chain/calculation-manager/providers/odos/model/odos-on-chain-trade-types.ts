import { EvmOnChainTradeStruct } from '../../common/on-chain-trade/evm-on-chain-trade/models/evm-on-chain-trade-struct';

export interface OdosTradeStruct extends EvmOnChainTradeStruct {
    /**
     * Used to make swap request with calculation data available by this unique id
     */
    pathId: string;
}
