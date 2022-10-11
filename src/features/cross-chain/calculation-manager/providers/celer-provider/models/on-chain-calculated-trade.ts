import BigNumber from 'bignumber.js';
import { CelerSupportedOnChainTrade } from 'src/features/cross-chain/calculation-manager/providers/celer-provider/models/celer-supported-on-chain-trade';

export interface OnChainCalculatedTrade {
    toAmount: BigNumber;
    providerIndex: number;
    onChainTrade: CelerSupportedOnChainTrade;
}
