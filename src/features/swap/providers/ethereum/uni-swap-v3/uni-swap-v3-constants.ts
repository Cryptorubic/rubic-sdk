import {
    swapRouterContractAbi,
    swapRouterContractAddress
} from '@features/swap/providers/ethereum/uni-swap-v3/constants/swap-router-contract-data';
import {
    quoterContractAbi,
    quoterContractAddress
} from '@features/swap/providers/ethereum/uni-swap-v3/constants/quoter-contract-data';

export const uniSwapV3ContractData = {
    swapRouter: {
        address: swapRouterContractAddress,
        abi: swapRouterContractAbi
    },
    quoter: {
        address: quoterContractAddress,
        abi: quoterContractAbi
    }
};

export const maxTransitPools = 1;
