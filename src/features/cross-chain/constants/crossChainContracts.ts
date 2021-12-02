import { BLOCKCHAIN_NAME } from '@core/blockchain/models/BLOCKCHAIN_NAME';
import { CrossChainContract } from '@features/cross-chain/cross-chain-contract/cross-chain-contract';
import { UniSwapV2Provider } from '@features/swap/providers/blockchains/ethereum/uni-swap-v2/uni-swap-v2-provider';
import { PancakeSwapProvider } from '@features/swap/providers/blockchains/bsc/pancake-swap/pancake-swap-provider';
import { QuickSwapProvider } from '@features/swap/providers/blockchains/polygon/quick-swap/quick-swap-provider';
import { PangolinAvalancheProvider } from '@features/swap/providers/blockchains/avalanche/pangolin/pangolin-avalanche-provider';
import { JoeAvalancheProvider } from '@features/swap/providers/blockchains/avalanche/joe/joe-avalanche-provider';
import { SolarbeamMoonriverProvider } from '@features/swap/providers/blockchains/moonriver/solarbeam/solarbeam-moonriver-provider';
import { SpookySwapFantomProvider } from '@features/swap/providers/blockchains/fantom/spooky-swap/spooky-swap-fantom-provider';
import { SupportedCrossChainBlockchain } from '@features/cross-chain/constants/SupportedCrossChainBlockchain';

export const crossChainContracts: Record<SupportedCrossChainBlockchain, CrossChainContract[]> = {
    [BLOCKCHAIN_NAME.ETHEREUM]: [
        new CrossChainContract(
            BLOCKCHAIN_NAME.ETHEREUM,
            '0xb9a94be803eC1197A234406eF5c0113f503d3178',
            new UniSwapV2Provider()
        )
    ],
    [BLOCKCHAIN_NAME.BINANCE_SMART_CHAIN]: [
        new CrossChainContract(
            BLOCKCHAIN_NAME.BINANCE_SMART_CHAIN,
            '0x6b8904739059afbaa91311aab99187f5885c6dc0',
            new PancakeSwapProvider()
        )
    ],
    [BLOCKCHAIN_NAME.POLYGON]: [
        new CrossChainContract(
            BLOCKCHAIN_NAME.POLYGON,
            '0xb02c0b6ba0e7719de2d44e613fc4ad01ac2f60ad',
            new QuickSwapProvider()
        )
    ],
    [BLOCKCHAIN_NAME.AVALANCHE]: [
        new CrossChainContract(
            BLOCKCHAIN_NAME.AVALANCHE,
            '0x3df5f6165fe8429744F9488a9C18259E9a93B4C0',
            new PangolinAvalancheProvider()
        ),
        new CrossChainContract(
            BLOCKCHAIN_NAME.AVALANCHE,
            '0x9375e3B9623610919750257C3A8667A62533bc93',
            new JoeAvalancheProvider()
        )
    ],
    [BLOCKCHAIN_NAME.MOONRIVER]: [
        new CrossChainContract(
            BLOCKCHAIN_NAME.MOONRIVER,
            '0x3645Dca27D9f5Cf5ee0d6f52EE53ae366e4ceAc2',
            new SolarbeamMoonriverProvider()
        )
    ],
    [BLOCKCHAIN_NAME.FANTOM]: [
        new CrossChainContract(
            BLOCKCHAIN_NAME.FANTOM,
            '0xeDfA29ca1BdbFaCBBDc6AAda385c983020015177',
            new SpookySwapFantomProvider()
        )
    ]
};
