import { BLOCKCHAIN_NAME } from '@core/blockchain/models/BLOCKCHAIN_NAME';
import { CrossChainContractData } from '@features/cross-chain/cross-chain-contract-data/cross-chain-contract-data';
import { PancakeSwapProvider } from '@features/instant-trades/dexes/bsc/pancake-swap/pancake-swap-provider';
import { UniSwapV2EthereumProvider } from '@features/instant-trades/dexes/ethereum/uni-swap-v2-ethereum/uni-swap-v2-ethereum-provider';
import { QuickSwapProvider } from '@features/instant-trades/dexes/polygon/quick-swap/quick-swap-provider';
import {
    CrossChainSupportedBlockchain,
    crossChainSupportedBlockchains
} from '@features/cross-chain/constants/cross-chain-supported-blockchains';
import { SpookySwapProvider } from '@features/instant-trades/dexes/fantom/spooky-swap/spooky-swap-provider';
import { JoeProvider } from '@features/instant-trades/dexes/avalanche/joe/joe-provider';
import { SolarbeamProvider } from '@features/instant-trades/dexes/moonriver/solarbeam/solarbeam-provider';
import { PangolinProvider } from '@features/instant-trades/dexes/avalanche/pangolin/pangolin-provider';
import { SushiSwapEthereumProvider } from '@features/instant-trades/dexes/ethereum/sushi-swap-ethereum/sushi-swap-ethereum-provider';
import { SushiSwapBscProvider } from '@features/instant-trades/dexes/bsc/sushi-swap-bsc/sushi-swap-bsc-provider';
import { SushiSwapPolygonProvider } from '@features/instant-trades/dexes/polygon/sushi-swap-polygon/sushi-swap-polygon-provider';
import { SushiSwapMoonriverProvider } from '@features/instant-trades/dexes/moonriver/sushi-swap-moonriver/sushi-swap-moonriver-provider';
import { SpiritSwapProvider } from '@features/instant-trades/dexes/fantom/spirit-swap/spirit-swap-provider';
import { SushiSwapFantomProvider } from '@features/instant-trades/dexes/fantom/sushi-swap-fantom/sushi-swap-fantom-provider';
import { SushiSwapAvalancheProvider } from '@features/instant-trades/dexes/avalanche/sushi-swap-avalanche/sushi-swap-avalanche-provider';
import { OneinchEthereumProvider } from '@features/instant-trades/dexes/ethereum/oneinch-ethereum/oneinch-ethereum-provider';
import { OneinchBscProvider } from '@features/instant-trades/dexes/bsc/oneinch-bsc/oneinch-bsc-provider';
import { OneinchPolygonProvider } from '@features/instant-trades/dexes/polygon/oneinch-polygon/oneinch-polygon-provider';
import { UniSwapV3EthereumProvider } from '@features/instant-trades/dexes/ethereum/uni-swap-v3-ethereum/uni-swap-v3-ethereum-provider';
import { UniSwapV3PolygonProvider } from '@features/instant-trades/dexes/polygon/uni-swap-v3-polygon/uni-swap-v3-polygon-provider';
import { AlgebraProvider } from '@features/instant-trades/dexes/polygon/algebra/algebra-provider';
import { ViperSwapHarmonyProvider } from '@features/instant-trades/dexes/harmony/viper-swap-harmony/viper-swap-harmony-provider';
import { SushiSwapHarmonyProvider } from '@features/instant-trades/dexes/harmony/sushi-swap-harmony/sushi-swap-harmony-provider';
import { OneinchArbitrumProvider } from '@features/instant-trades/dexes/arbitrum/oneinch-arbitrum/oneinch-arbitrum-provider';
import { SushiSwapArbitrumProvider } from '@features/instant-trades/dexes/arbitrum/sushi-swap-arbitrum/sushi-swap-arbitrum-provider';
import { UniSwapV3ArbitrumProvider } from '@features/instant-trades/dexes/arbitrum/uni-swap-v3-arbitrum/uni-swap-v3-arbitrum-provider';
import { WannaSwapAuroraProvider } from '@features/instant-trades/dexes/aurora/wanna-swap-aurora/wanna-swap-aurora-provider';
import { TrisolarisAuroraProvider } from '@features/instant-trades/dexes/aurora/trisolaris-aurora/trisolaris-aurora-provider';

/**
 * Stores contracts info.
 * Every contract may have several instant-trade providers.
 * Because of that every provider has `method suffix` - suffix
 * to add to default swap-method name to call that provider's method.
 */
export const crossChainContractsData = {
    [BLOCKCHAIN_NAME.ETHEREUM]: {
        address: '0xD8b19613723215EF8CC80fC35A1428f8E8826940',
        providersData: [
            {
                ProviderClass: UniSwapV2EthereumProvider,
                methodSuffix: ''
            },
            {
                ProviderClass: SushiSwapEthereumProvider,
                methodSuffix: '1'
            },
            {
                ProviderClass: UniSwapV3EthereumProvider,
                methodSuffix: 'V3'
            },
            {
                ProviderClass: OneinchEthereumProvider,
                methodSuffix: 'Inch'
            }
        ]
    },
    [BLOCKCHAIN_NAME.BINANCE_SMART_CHAIN]: {
        address: '0x70e8C8139d1ceF162D5ba3B286380EB5913098c4',
        providersData: [
            {
                ProviderClass: PancakeSwapProvider,
                methodSuffix: ''
            },
            {
                ProviderClass: SushiSwapBscProvider,
                methodSuffix: '1'
            },
            {
                ProviderClass: OneinchBscProvider,
                methodSuffix: 'Inch'
            }
        ]
    },
    [BLOCKCHAIN_NAME.POLYGON]: {
        address: '0xeC52A30E4bFe2D6B0ba1D0dbf78f265c0a119286',
        providersData: [
            {
                ProviderClass: QuickSwapProvider,
                methodSuffix: ''
            },
            {
                ProviderClass: SushiSwapPolygonProvider,
                methodSuffix: '1'
            },
            {
                ProviderClass: UniSwapV3PolygonProvider,
                methodSuffix: 'V3'
            },
            {
                ProviderClass: AlgebraProvider,
                methodSuffix: 'ALGB'
            },
            {
                ProviderClass: OneinchPolygonProvider,
                methodSuffix: 'Inch'
            }
        ]
    },
    [BLOCKCHAIN_NAME.AVALANCHE]: {
        address: '0x541eC7c03F330605a2176fCD9c255596a30C00dB',
        providersData: [
            {
                ProviderClass: PangolinProvider,
                methodSuffix: 'AVAX'
            },
            {
                ProviderClass: JoeProvider,
                methodSuffix: 'AVAX1'
            },
            {
                ProviderClass: SushiSwapAvalancheProvider,
                methodSuffix: ''
            }
        ]
    },
    [BLOCKCHAIN_NAME.MOONRIVER]: {
        address: '0xD8b19613723215EF8CC80fC35A1428f8E8826940',
        providersData: [
            {
                ProviderClass: SolarbeamProvider,
                methodSuffix: ''
            },
            {
                ProviderClass: SushiSwapMoonriverProvider,
                methodSuffix: '1'
            }
        ]
    },
    [BLOCKCHAIN_NAME.FANTOM]: {
        address: '0xd23B4dA264A756F427e13C72AB6cA5A6C95E4608',
        providersData: [
            {
                ProviderClass: SpookySwapProvider,
                methodSuffix: ''
            },
            {
                ProviderClass: SpiritSwapProvider,
                methodSuffix: '1'
            },
            {
                ProviderClass: SushiSwapFantomProvider,
                methodSuffix: '2'
            }
        ]
    },
    [BLOCKCHAIN_NAME.HARMONY]: {
        address: '0x5681012ccc3ec5bafefac21ce4280ad7fe22bbf2',
        providersData: [
            {
                ProviderClass: SushiSwapHarmonyProvider,
                methodSuffix: ''
            },
            {
                ProviderClass: ViperSwapHarmonyProvider,
                methodSuffix: '1'
            }
        ]
    },
    [BLOCKCHAIN_NAME.ARBITRUM]: {
        address: '0x5F3c8d58A01Aad4f875d55E2835D82e12f99723c',
        providersData: [
            {
                ProviderClass: SushiSwapArbitrumProvider,
                methodSuffix: ''
            },
            {
                ProviderClass: UniSwapV3ArbitrumProvider,
                methodSuffix: 'V3'
            },
            {
                ProviderClass: OneinchArbitrumProvider,
                methodSuffix: 'Inch'
            }
        ]
    },
    [BLOCKCHAIN_NAME.AURORA]: {
        address: '0x55Be05ecC1c417B16163b000CB71DcE8526a5D06',
        providersData: [
            {
                ProviderClass: TrisolarisAuroraProvider,
                methodSuffix: ''
            },
            {
                ProviderClass: WannaSwapAuroraProvider,
                methodSuffix: '1'
            }
        ]
    }
} as const;

const crossChainContracts: Record<CrossChainSupportedBlockchain, CrossChainContractData | null> =
    crossChainSupportedBlockchains.reduce(
        (acc, blockchain) => ({ ...acc, [blockchain]: null }),
        {} as Record<CrossChainSupportedBlockchain, CrossChainContractData | null>
    );

export function getCrossChainContract(
    blockchain: CrossChainSupportedBlockchain
): CrossChainContractData {
    const storedContract = crossChainContracts[blockchain];
    if (storedContract) {
        return storedContract;
    }

    const contract = crossChainContractsData[blockchain];
    crossChainContracts[blockchain] = new CrossChainContractData(
        blockchain,
        contract.address,
        contract.providersData.map(providerData => ({
            provider: new providerData.ProviderClass(),
            methodSuffix: providerData.methodSuffix
        }))
    );

    return crossChainContracts[blockchain]!;
}
