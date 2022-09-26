import { EvmBridgersTransactionData } from 'src/features/cross-chain/providers/bridgers-provider/evm-bridgers-trade/models/evm-bridgers-transaction-data';
import { TronBridgersTransactionData } from 'src/features/cross-chain/providers/bridgers-provider/tron-bridgers-trade/models/tron-bridgers-transaction-data';

export interface BridgersSwapResponse<
    T extends EvmBridgersTransactionData | TronBridgersTransactionData
> {
    data: {
        txData: T;
    };
}
