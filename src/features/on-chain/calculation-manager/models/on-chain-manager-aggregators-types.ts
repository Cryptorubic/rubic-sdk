import { OneInchProvider } from 'src/features/on-chain/calculation-manager/providers/aggregators/1inch/one-inch-provider';
import { DlnOnChainProvider } from 'src/features/on-chain/calculation-manager/providers/aggregators/dln/dln-on-chain-provider';
import { PiteasProvider } from 'src/features/on-chain/calculation-manager/providers/aggregators/piteas/piteas-provider';

import { CoffeeSwapProvider } from '../providers/aggregators/coffee-swap/coffee-swap-on-chain-provider';
import { DedustOnChainProvider } from '../providers/aggregators/dedust/dedust-on-chain-provider';
import { LifiProvider } from '../providers/aggregators/lifi/lifi-provider';
import { NativeRouterProvider } from '../providers/aggregators/native-router/native-router-provider';
import { OdosOnChainProvider } from '../providers/aggregators/odos/odos-on-chain-provider';
import { OkuSwapOnChainProvider } from '../providers/aggregators/okuswap/okuswap-on-chain-provider';
import { OpenOceanProvider } from '../providers/aggregators/open-ocean/open-ocean-provider';
import { RangoOnChainProvider } from '../providers/aggregators/rango/rango-on-chain-provider';
import { SquidRouterOnChainProvider } from '../providers/aggregators/squidrouter/squidrouter-on-chain-provider';
import { ToncoOnChainProvider } from '../providers/aggregators/tonco/tonco-on-chain-provider';
import { UniZenOnChainProvider } from '../providers/aggregators/unizen/unizen-on-chain-provider';
import { XyDexProvider } from '../providers/aggregators/xy-dex/xy-dex-provider';
import { ZetaSwapProvider } from '../providers/aggregators/zetaswap/zetaswap-provider';

export const AGGREGATORS_ON_CHAIN = {
    LIFI: LifiProvider,
    OPEN_OCEAN: OpenOceanProvider,
    RANGO: RangoOnChainProvider,
    ODOS: OdosOnChainProvider,
    DLN: DlnOnChainProvider,
    OKU_SWAP: OkuSwapOnChainProvider,
    PITEAS: PiteasProvider,
    XY: XyDexProvider,
    // ZRX: ZrxProvider, not free api
    ONE_INCH: OneInchProvider,
    ZETA_SWAP: ZetaSwapProvider,
    NATIVE_ROUTER: NativeRouterProvider,
    DEDUST: DedustOnChainProvider,
    //STONFI: StonfiOnChainProvider,
    COFFEE_SWAP: CoffeeSwapProvider,
    SQUIDROUTER: SquidRouterOnChainProvider,
    UNIZEN: UniZenOnChainProvider,
    TONCO_DEX: ToncoOnChainProvider
} as const;
