import { InchCelerSwapInfo } from 'src/features/cross-chain/providers/celer-trade-provider/celer-cross-chain-contract-trade/models/inch-celer-swap-info';
import { v2LikeCelerSwap } from 'src/features/cross-chain/providers/celer-trade-provider/celer-cross-chain-contract-trade/models/v2-like-celer-swap-info';
import { v3LikeCelerSwapInfo } from 'src/features/cross-chain/providers/celer-trade-provider/celer-cross-chain-contract-trade/models/v3-like-celer-swap-info';
import { BridgeCelerSwapInfo } from 'src/features/cross-chain/providers/celer-trade-provider/celer-cross-chain-contract-trade/models/bridge-celer-swap-info';

export type SourceCelerSwapInfo =
    | InchCelerSwapInfo
    | v2LikeCelerSwap
    | v3LikeCelerSwapInfo
    | BridgeCelerSwapInfo;
