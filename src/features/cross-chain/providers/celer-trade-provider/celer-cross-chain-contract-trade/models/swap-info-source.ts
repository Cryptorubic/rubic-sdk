import { SwapInfoInch } from '@features/cross-chain/providers/celer-trade-provider/celer-cross-chain-contract-trade/models/swap-info-inch.interface';
import { SwapInfoV2 } from '@features/cross-chain/providers/celer-trade-provider/celer-cross-chain-contract-trade/models/swap-info-v2.interface';
import { SwapInfoV3 } from '@features/cross-chain/providers/celer-trade-provider/celer-cross-chain-contract-trade/models/swap-info-v3.interface';
import { SwapInfoBridge } from '@features/cross-chain/providers/celer-trade-provider/celer-cross-chain-contract-trade/models/swap-info-bridge.interface';

export type SwapInfoSource = SwapInfoInch | SwapInfoV2 | SwapInfoV3 | SwapInfoBridge;
