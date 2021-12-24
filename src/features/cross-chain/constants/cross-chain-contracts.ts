import { BLOCKCHAIN_NAME } from '@core/blockchain/models/BLOCKCHAIN_NAME';
import { CrossChainContract } from '@features/cross-chain/cross-chain-contract/cross-chain-contract';
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

export const crossChainContractsData = {
    [BLOCKCHAIN_NAME.ETHEREUM]: [
        {
            address: '0xb9a94be803eC1197A234406eF5c0113f503d3178',
            Provider: UniSwapV2Provider
        }
    ],
    [BLOCKCHAIN_NAME.BINANCE_SMART_CHAIN]: [
        {
            address: '0x6b8904739059afbaa91311aab99187f5885c6dc0',
            Provider: PancakeSwapProvider
        }
    ],
    [BLOCKCHAIN_NAME.POLYGON]: [
        {
            address: '0xb02c0b6ba0e7719de2d44e613fc4ad01ac2f60ad',
            Provider: QuickSwapProvider
        }
    ],
    [BLOCKCHAIN_NAME.AVALANCHE]: [
        {
            address: '0x3df5f6165fe8429744F9488a9C18259E9a93B4C0',
            Provider: PangolinProvider
        },
        {
            address: '0x9375e3B9623610919750257C3A8667A62533bc93',
            Provider: JoeProvider
        }
    ],
    [BLOCKCHAIN_NAME.MOONRIVER]: [
        {
            address: '0x3645Dca27D9f5Cf5ee0d6f52EE53ae366e4ceAc2',
            Provider: SolarbeamProvider
        }
    ],
    [BLOCKCHAIN_NAME.FANTOM]: [
        {
            address: '0xeDfA29ca1BdbFaCBBDc6AAda385c983020015177',
            Provider: SpookySwapProvider
        }
    ]
} as const;

const crossChainContracts: Record<CrossChainSupportedBlockchain, CrossChainContract[] | null> =
    crossChainSupportedBlockchains.reduce(
        (acc, blockchain) => ({ ...acc, [blockchain]: null }),
        {} as Record<CrossChainSupportedBlockchain, CrossChainContract[] | null>
    );

export function getCrossChainContract(
    blockchain: CrossChainSupportedBlockchain
): CrossChainContract[] {
    const storedContract = crossChainContracts[blockchain];
    if (storedContract) {
        return storedContract;
    }

    const contractCreationData = crossChainContractsData[blockchain];
    const contracts = contractCreationData.map(
        data => new CrossChainContract(blockchain, data.address, new data.Provider())
    );
    crossChainContracts[blockchain] = contracts;
    return contracts;
}
