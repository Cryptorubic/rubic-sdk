import { CrossChainContract } from '../cross-chain-contract/cross-chain-contract';
import { PancakeSwapProvider } from '../../swap/dexes/bsc/pancake-swap/pancake-swap-provider';
import { UniSwapV2Provider } from '../../swap/dexes/ethereum/uni-swap-v2/uni-swap-v2-provider';
import { QuickSwapProvider } from '../../swap/dexes/polygon/quick-swap/quick-swap-provider';
import { CrossChainSupportedBlockchain } from './CrossChainSupportedBlockchains';
import { SpookySwapProvider } from '../../swap/dexes/fantom/spooky-swap/spooky-swap-provider';
import { JoeProvider } from '../../swap/dexes/avalanche/joe/joe-provider';
import { SolarbeamProvider } from '../../swap/dexes/moonriver/solarbeam/solarbeam-provider';
import { PangolinProvider } from '../../swap/dexes/avalanche/pangolin/pangolin-provider';
export declare const crossChainContractsData: {
    readonly ETH: readonly [{
        readonly address: "0xb9a94be803eC1197A234406eF5c0113f503d3178";
        readonly Provider: typeof UniSwapV2Provider;
    }];
    readonly BSC: readonly [{
        readonly address: "0x6b8904739059afbaa91311aab99187f5885c6dc0";
        readonly Provider: typeof PancakeSwapProvider;
    }];
    readonly POLYGON: readonly [{
        readonly address: "0xb02c0b6ba0e7719de2d44e613fc4ad01ac2f60ad";
        readonly Provider: typeof QuickSwapProvider;
    }];
    readonly AVALANCHE: readonly [{
        readonly address: "0x3df5f6165fe8429744F9488a9C18259E9a93B4C0";
        readonly Provider: typeof PangolinProvider;
    }, {
        readonly address: "0x9375e3B9623610919750257C3A8667A62533bc93";
        readonly Provider: typeof JoeProvider;
    }];
    readonly MOONRIVER: readonly [{
        readonly address: "0x3645Dca27D9f5Cf5ee0d6f52EE53ae366e4ceAc2";
        readonly Provider: typeof SolarbeamProvider;
    }];
    readonly FANTOM: readonly [{
        readonly address: "0xeDfA29ca1BdbFaCBBDc6AAda385c983020015177";
        readonly Provider: typeof SpookySwapProvider;
    }];
};
export declare function getCrossChainContract(blockchain: CrossChainSupportedBlockchain): CrossChainContract[];
