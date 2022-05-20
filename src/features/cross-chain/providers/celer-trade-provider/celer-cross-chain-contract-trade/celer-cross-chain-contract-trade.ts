import { CrossChainContractTrade } from '@features/cross-chain/providers/common/cross-chain-contract-trade';
import { BlockchainName } from 'src/core';
import { AbiItem } from 'web3-utils';
import { CelerSwapMethod } from '@features/cross-chain/providers/celer-trade-provider/constants/celer-swap-methods';
import {
    isOneInchLikeProvider,
    isUniswapV2LikeProvider,
    isUniswapV3LikeProvider
} from '@features/instant-trades/utils/type-guards';
import { celerCrossChainContractAbi } from '@features/cross-chain/providers/celer-trade-provider/constants/celer-cross-chain-contract-abi';
import { CelerCrossChainContractData } from '@features/cross-chain/providers/celer-trade-provider/celer-cross-chain-contract-data';

export abstract class CelerCrossChainContractTrade extends CrossChainContractTrade {
    protected constructor(
        blockchain: BlockchainName,
        public readonly contract: CelerCrossChainContractData,
        providerIndex: number
    ) {
        super(blockchain, providerIndex);
    }

    /**
     * Returns method's name and contract abi to call in source network.
     */
    public getMethodNameAndContractAbi(): {
        methodName: string;
        contractAbi: AbiItem[];
    } {
        const methodName = this.getSwapMethod();
        const contractAbiMethod = this.getAbiMethodByProvider(methodName);

        contractAbiMethod.name = methodName;

        return {
            methodName,
            contractAbi: [contractAbiMethod]
        };
    }

    private getAbiMethodByProvider(methodName: string): AbiItem {
        return {
            ...celerCrossChainContractAbi.find(method => method?.name?.startsWith(methodName))!
        };
    }

    /**
     * Returns swap method name in target network.
     * Must be called on target contract.
     */
    public getSwapToUserMethodSignature(): string {
        return '';
    }

    private getSwapMethod(): CelerSwapMethod {
        const nativeIn = this.fromToken.isNative;

        if (this.fromToken.isEqualTo(this.toToken)) {
            return nativeIn ? CelerSwapMethod.SWAP_BRIDGE_NATIVE : CelerSwapMethod.SWAP_BRIDGE;
        }

        if (isOneInchLikeProvider(this.provider)) {
            return nativeIn ? CelerSwapMethod.SWAP_INCH_NATIVE : CelerSwapMethod.SWAP_INCH;
        }

        if (isUniswapV2LikeProvider(this.provider)) {
            return nativeIn ? CelerSwapMethod.SWAP_V2_NATIVE : CelerSwapMethod.SWAP_V2;
        }

        if (isUniswapV3LikeProvider(this.provider)) {
            return nativeIn ? CelerSwapMethod.SWAP_V3_NATIVE : CelerSwapMethod.SWAP_V3;
        }
        throw new Error('[RUBIC SDK]: Unknown swap method.');
    }

    public abstract getCelerSourceTrade(): unknown[] | unknown;

    public abstract getCelerDestionationTrade(integratorAddress: string): unknown[];
}
