import { BridgersSourceFlag } from 'src/features/common/providers/bridgers/models/bridgers-source-flag';
import { EvmBridgersTransactionData } from 'src/features/cross-chain/calculation-manager/providers/bridgers-provider/models/evm-bridgers-transaction-data';
import { TonBridgersTransactionData } from 'src/features/cross-chain/calculation-manager/providers/bridgers-provider/models/ton-bridgers-transaction-data';
import { TronBridgersTransactionData } from 'src/features/cross-chain/calculation-manager/providers/bridgers-provider/models/tron-bridgers-transaction-data';

export interface BridgersSwapRequest {
    fromTokenAddress: string;
    toTokenAddress: string;
    fromAddress: string;
    toAddress: string;
    fromTokenChain: string;
    toTokenChain: string;
    fromTokenAmount: string;
    amountOutMin: string;
    equipmentNo: string;
    sourceFlag: BridgersSourceFlag;
    slippage?: string;
}

export interface BridgersSwapResponse<
    T extends EvmBridgersTransactionData | TronBridgersTransactionData | TonBridgersTransactionData
> {
    data: {
        txData: T;
    };
    resCode: number;
}
