import { LifiProvider } from '../providers/aggregators/lifi/lifi-provider';
import { OdosOnChainProvider } from '../providers/aggregators/odos/odos-on-chain-provider';
import { OpenOceanProvider } from '../providers/aggregators/open-ocean/open-ocean-provider';
import { RangoOnChainProvider } from '../providers/aggregators/rango/rango-on-chain-provider';

export const AGGREGATORS_ON_CHAIN = {
    LIFI: LifiProvider,
    OPEN_OCEAN: OpenOceanProvider,
    RANGO: RangoOnChainProvider,
    ODOS: OdosOnChainProvider
    // SYMBIOSIS: SymbiosisOnChainProvider
} as const;
