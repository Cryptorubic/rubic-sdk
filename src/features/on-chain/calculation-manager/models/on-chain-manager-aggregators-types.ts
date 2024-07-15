import { OneInchProvider } from 'src/features/on-chain/calculation-manager/providers/aggregators/1inch/one-inch-provider';
import { DlnOnChainProvider } from 'src/features/on-chain/calculation-manager/providers/aggregators/dln/dln-on-chain-provider';
import { PiteasProvider } from 'src/features/on-chain/calculation-manager/providers/aggregators/piteas/piteas-provider';
import { XyDexProvider } from 'src/features/on-chain/calculation-manager/providers/aggregators/xy-dex/xy-dex-provider';
import { ZrxProvider } from 'src/features/on-chain/calculation-manager/providers/aggregators/zrx/zrx-provider';

import { LifiProvider } from '../providers/aggregators/lifi/lifi-provider';
import { NativeRouterProvider } from '../providers/aggregators/native-router/native-router-provider';
import { OdosOnChainProvider } from '../providers/aggregators/odos/odos-on-chain-provider';
import { OkuSwapOnChainProvider } from '../providers/aggregators/okuswap/okuswap-on-chain-provider';
import { OpenOceanProvider } from '../providers/aggregators/open-ocean/open-ocean-provider';
import { RangoOnChainProvider } from '../providers/aggregators/rango/rango-on-chain-provider';
import { TonkeeperOnChainProvider } from '../providers/aggregators/tonkeeper/tonkeeper-on-chain-provider';
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
    ZRX: ZrxProvider,
    ONE_INCH: OneInchProvider,
    ZETA_SWAP: ZetaSwapProvider,
    NATIVE_ROUTER: NativeRouterProvider,
    TONKEEPER: TonkeeperOnChainProvider
    // SYMBIOSIS: SymbiosisOnChainProvider
} as const;
