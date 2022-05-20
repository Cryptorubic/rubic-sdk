import BigNumber from 'bignumber.js';
import { CrossChainSupportedInstantTrade } from '@features/cross-chain/providers/common/models/cross-chain-supported-instant-trade';

export interface ItCalculatedTrade {
    toAmount: BigNumber;
    providerIndex: number;
    instantTrade: CrossChainSupportedInstantTrade;
}
