import { SwapInfoDest } from '@features/cross-chain/providers/celer-trade-provider/celer-cross-chain-contract-trade/models/swap-info-dest.interface';
import { SwapInfoSource } from '@features/cross-chain/providers/celer-trade-provider/celer-cross-chain-contract-trade/models/swap-info-source';

export interface CrossChainInstantTrade {
    getFirstPath(): string[] | string;

    getSecondPath(): string[];

    modifyArgumentsForProvider(
        methodArguments: unknown[][],
        walletAddress: string,
        swapTokenWithFee?: boolean
    ): Promise<void>;

    getCelerSourceObject(slippage: number): SwapInfoSource;

    getCelerDestinationObject(slippage: number, integratorAddress: string): SwapInfoDest;
}
