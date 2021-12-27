import { ContractData } from '../contract-data/contract-data';
import { PancakeSwapProvider } from '../../swap/dexes/bsc/pancake-swap/pancake-swap-provider';
import { UniSwapV2Provider } from '../../swap/dexes/ethereum/uni-swap-v2/uni-swap-v2-provider';
import { QuickSwapProvider } from '../../swap/dexes/polygon/quick-swap/quick-swap-provider';
import { CrossChainSupportedBlockchain } from './cross-chain-supported-blockchains';
import { SpookySwapProvider } from '../../swap/dexes/fantom/spooky-swap/spooky-swap-provider';
import { JoeProvider } from '../../swap/dexes/avalanche/joe/joe-provider';
import { SolarbeamProvider } from '../../swap/dexes/moonriver/solarbeam/solarbeam-provider';
import { PangolinProvider } from '../../swap/dexes/avalanche/pangolin/pangolin-provider';
export declare const crossChainContractsData: {
    readonly ETH: {
        readonly address: "0xb9a94be803eC1197A234406eF5c0113f503d3178";
        readonly providersData: readonly [{
            readonly ProviderClass: typeof UniSwapV2Provider;
            readonly methodSuffix: "";
        }];
    };
    readonly BSC: {
        readonly address: "0x6b8904739059afbaa91311aab99187f5885c6dc0";
        readonly providersData: readonly [{
            readonly ProviderClass: typeof PancakeSwapProvider;
            readonly methodSuffix: "";
        }];
    };
    readonly POLYGON: {
        readonly address: "0xe6625BBE80710C7Bb473721EdAC24Ce326940a6f";
        readonly providersData: readonly [{
            readonly ProviderClass: typeof QuickSwapProvider;
            readonly methodSuffix: "";
        }];
    };
    readonly AVALANCHE: {
        readonly address: "0xd23B4dA264A756F427e13C72AB6cA5A6C95E4608";
        readonly providersData: readonly [{
            readonly ProviderClass: typeof PangolinProvider;
            readonly methodSuffix: "";
        }, {
            readonly ProviderClass: typeof JoeProvider;
            readonly methodSuffix: "1";
        }];
    };
    readonly MOONRIVER: {
        readonly address: "0x3645Dca27D9f5Cf5ee0d6f52EE53ae366e4ceAc2";
        readonly providersData: readonly [{
            readonly ProviderClass: typeof SolarbeamProvider;
            readonly methodSuffix: "";
        }];
    };
    readonly FANTOM: {
        readonly address: "0xeDfA29ca1BdbFaCBBDc6AAda385c983020015177";
        readonly providersData: readonly [{
            readonly ProviderClass: typeof SpookySwapProvider;
            readonly methodSuffix: "";
        }];
    };
};
export declare function getCrossChainContract(blockchain: CrossChainSupportedBlockchain): ContractData;
