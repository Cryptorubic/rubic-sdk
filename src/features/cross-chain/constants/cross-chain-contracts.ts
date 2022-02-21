import { BLOCKCHAIN_NAME } from '@core/blockchain/models/BLOCKCHAIN_NAME';
import { CrossChainContractData } from '@features/cross-chain/contract-data/cross-chain-contract-data';
import { PancakeSwapProvider } from '@features/swap/dexes/bsc/pancake-swap/pancake-swap-provider';
import { UniSwapV2Provider } from '@features/swap/dexes/ethereum/uni-swap-v2/uni-swap-v2-provider';
import { QuickSwapProvider } from '@features/swap/dexes/polygon/quick-swap/quick-swap-provider';
import {
    CrossChainSupportedBlockchain,
    crossChainSupportedBlockchains
} from '@features/cross-chain/constants/cross-chain-supported-blockchains';
import { SpookySwapProvider } from '@features/swap/dexes/fantom/spooky-swap/spooky-swap-provider';
import { JoeProvider } from '@features/swap/dexes/avalanche/joe/joe-provider';
import { SolarbeamProvider } from '@features/swap/dexes/moonriver/solarbeam/solarbeam-provider';
import { PangolinProvider } from '@features/swap/dexes/avalanche/pangolin/pangolin-provider';
import { SushiSwapEthereumProvider } from '@features/swap/dexes/ethereum/sushi-swap-ethereum/sushi-swap-ethereum-provider';
import { SushiSwapBscProvider } from '@features/swap/dexes/bsc/sushi-swap-bsc/sushi-swap-bsc-provider';
import { SushiSwapPolygonProvider } from '@features/swap/dexes/polygon/sushi-swap-polygon/sushi-swap-polygon-provider';
import { SushiSwapMoonriverProvider } from '@features/swap/dexes/moonriver/sushi-swap-moonriver/sushi-swap-moonriver-provider';
import { SpiritSwapProvider } from '@features/swap/dexes/fantom/spirit-swap/spirit-swap-provider';
import { SushiSwapFantomProvider } from '@features/swap/dexes/fantom/sushi-swap-fantom/sushi-swap-fantom-provider';
import { SushiSwapAvalancheProvider } from '@features/swap/dexes/avalanche/sushi-swap-avalanche/sushi-swap-avalanche-provider';
import { OneinchEthereumProvider } from '@features/swap/dexes/ethereum/oneinch-ethereum/oneinch-ethereum-provider';
import { OneinchBscProvider } from '@features/swap/dexes/bsc/oneinch-bsc/oneinch-bsc-provider';
import { OneinchPolygonProvider } from '@features/swap/dexes/polygon/oneinch-polygon/oneinch-polygon-provider';
import { UniSwapV3EthereumProvider } from '@features/swap/dexes/ethereum/uni-swap-v3-ethereum/uni-swap-v3-ethereum-provider';
import { UniSwapV3PolygonProvider } from '@features/swap/dexes/polygon/uni-swap-v3-polygon/uni-swap-v3-polygon-provider';
import { AlgebraProvider } from '@features/swap/dexes/polygon/algebra/algebra-provider';

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
                ProviderClass: UniSwapV2Provider,
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
