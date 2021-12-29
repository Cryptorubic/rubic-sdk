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

/**
 * Stores contracts info.
 * Every contract may have several instant-trade providers.
 * Because of that every provider has `method suffix` - suffix
 * to add to default swap-method name to call that provider's method.
 */
export const crossChainContractsData = {
    [BLOCKCHAIN_NAME.ETHEREUM]: {
        address: '0xb9a94be803eC1197A234406eF5c0113f503d3178',
        providersData: [
            {
                ProviderClass: UniSwapV2Provider,
                methodSuffix: ''
            }
        ]
    },
    [BLOCKCHAIN_NAME.BINANCE_SMART_CHAIN]: {
        address: '0x6b8904739059afbaa91311aab99187f5885c6dc0',
        providersData: [
            {
                ProviderClass: PancakeSwapProvider,
                methodSuffix: ''
            }
        ]
    },
    [BLOCKCHAIN_NAME.POLYGON]: {
        address: '0xe6625BBE80710C7Bb473721EdAC24Ce326940a6f',
        providersData: [
            {
                ProviderClass: QuickSwapProvider,
                methodSuffix: ''
            }
        ]
    },
    [BLOCKCHAIN_NAME.AVALANCHE]: {
        address: '0xd23B4dA264A756F427e13C72AB6cA5A6C95E4608',
        providersData: [
            {
                ProviderClass: PangolinProvider,
                methodSuffix: ''
            },
            {
                ProviderClass: JoeProvider,
                methodSuffix: '1'
            }
        ]
    },
    [BLOCKCHAIN_NAME.MOONRIVER]: {
        address: '0x3645Dca27D9f5Cf5ee0d6f52EE53ae366e4ceAc2',
        providersData: [
            {
                ProviderClass: SolarbeamProvider,
                methodSuffix: ''
            }
        ]
    },
    [BLOCKCHAIN_NAME.FANTOM]: {
        address: '0xeDfA29ca1BdbFaCBBDc6AAda385c983020015177',
        providersData: [
            {
                ProviderClass: SpookySwapProvider,
                methodSuffix: ''
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
