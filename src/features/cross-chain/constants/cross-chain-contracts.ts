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
            }
        ]
    },
    [BLOCKCHAIN_NAME.BINANCE_SMART_CHAIN]: {
        address: '0xEda6DdA4fD1581B6Ab8951750DB596566d0FBf9C',
        providersData: [
            {
                ProviderClass: PancakeSwapProvider,
                methodSuffix: ''
            },
            {
                ProviderClass: SushiSwapBscProvider,
                methodSuffix: '1'
            }
        ]
    },
    [BLOCKCHAIN_NAME.POLYGON]: {
        address: '0xe6625BBE80710C7Bb473721EdAC24Ce326940a6f',
        providersData: [
            {
                ProviderClass: QuickSwapProvider,
                methodSuffix: ''
            },
            {
                ProviderClass: SushiSwapPolygonProvider,
                methodSuffix: '1'
            }
        ]
    },
    [BLOCKCHAIN_NAME.AVALANCHE]: {
        address: '0xd23B4dA264A756F427e13C72AB6cA5A6C95E4608',
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
        address: '0x55Be05ecC1c417B16163b000CB71DcE8526a5D06',
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
