import { InchCelerSwapInfo } from 'src/features/cross-chain/calculation-manager/providers/celer-provider/celer-contract-trade/models/inch-celer-swap-info';
import { v2LikeCelerSwap } from 'src/features/cross-chain/calculation-manager/providers/celer-provider/celer-contract-trade/models/v2-like-celer-swap-info';
import { v3LikeCelerSwapInfo } from 'src/features/cross-chain/calculation-manager/providers/celer-provider/celer-contract-trade/models/v3-like-celer-swap-info';
import { BridgeCelerSwapInfo } from 'src/features/cross-chain/calculation-manager/providers/celer-provider/celer-contract-trade/models/bridge-celer-swap-info';

export type SourceCelerSwapInfo =
    | InchCelerSwapInfo
    | v2LikeCelerSwap
    | v3LikeCelerSwapInfo
    | BridgeCelerSwapInfo;
