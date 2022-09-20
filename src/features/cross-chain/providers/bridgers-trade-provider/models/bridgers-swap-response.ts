import { EvmBridgersTransactionData } from 'src/features/cross-chain/providers/bridgers-trade-provider/evm-bridgers-trade/models/evm-bridgers-transaction-data';
import { TronBridgersTransactionData } from 'src/features/cross-chain/providers/bridgers-trade-provider/tron-bridgers-trade/models/tron-bridgers-transaction-data';

export interface BridgersSwapResponse<
    T extends EvmBridgersTransactionData | TronBridgersTransactionData
> {
    data: {
        txData: T;
    };
}
