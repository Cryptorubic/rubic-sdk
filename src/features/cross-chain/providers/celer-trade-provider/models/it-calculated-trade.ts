import BigNumber from 'bignumber.js';
import { CrossChainSupportedInstantTrade } from 'src/features/cross-chain/providers/celer-trade-provider/models/cross-chain-supported-instant-trade';

export interface ItCalculatedTrade {
    toAmount: BigNumber;
    providerIndex: number;
    instantTrade: CrossChainSupportedInstantTrade;
}
