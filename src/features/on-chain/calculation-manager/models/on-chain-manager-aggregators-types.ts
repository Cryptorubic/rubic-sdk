import { LifiProvider } from '../providers/aggregators/lifi/lifi-provider';
import { OpenOceanProvider } from '../providers/aggregators/open-ocean/open-ocean-provider';
import { RangoOnChainProvider } from '../providers/aggregators/rango/rango-on-chain-provider';
import { SymbiosisOnChainProvider } from '../providers/aggregators/symbiosis/symbiosis-on-chain-provider';

export const AGGREGATORS_ON_CHAIN = {
    LIFI: new LifiProvider(),
    OPEN_OCEAN: new OpenOceanProvider(),
    RANGO: new RangoOnChainProvider(),
    SYMBIOSIS: new SymbiosisOnChainProvider()
} as const;

export type AggregatorOnChain = (typeof AGGREGATORS_ON_CHAIN)[keyof typeof AGGREGATORS_ON_CHAIN];
