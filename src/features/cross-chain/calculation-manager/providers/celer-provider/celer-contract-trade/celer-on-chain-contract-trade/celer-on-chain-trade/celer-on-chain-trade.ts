import { DestinationCelerSwapInfo } from 'src/features/cross-chain/calculation-manager/providers/celer-provider/celer-contract-trade/models/destination-celer-swap-info';
import { SourceCelerSwapInfo } from 'src/features/cross-chain/calculation-manager/providers/celer-provider/celer-contract-trade/models/source-celer-swap-info';

export interface CelerOnChainTrade {
    readonly defaultDeadline: number;

    getFirstPath(): string[] | string;

    getSecondPath(): string[];

    modifyArgumentsForProvider(
        methodArguments: unknown[][],
        walletAddress: string,
        swapTokenWithFee?: boolean
    ): Promise<void>;

    getCelerSourceObject(): SourceCelerSwapInfo;

    getCelerDestinationObject(
        integratorAddress: string,
        receiverAddress: string
    ): DestinationCelerSwapInfo;
}
