import { BlockchainName } from 'src/core';
import { AbiItem } from 'web3-utils';
import { CelerSwapMethod } from '@rsdk-features/cross-chain/providers/celer-trade-provider/constants/celer-swap-methods';
import {
    isAlgebraProvider,
    isOneInchLikeProvider,
    isUniswapV2LikeProvider,
    isUniswapV3LikeProvider
} from '@rsdk-features/instant-trades/utils/type-guards';
import { celerCrossChainContractAbi } from '@rsdk-features/cross-chain/providers/celer-trade-provider/constants/celer-cross-chain-contract-abi';
import { CelerCrossChainContractData } from '@rsdk-features/cross-chain/providers/celer-trade-provider/celer-cross-chain-contract-data';
import { CrossChainContractTrade } from '@rsdk-features/cross-chain/providers/common/celer-rubic/cross-chain-contract-trade';
import { RubicSdkError } from 'src/common';

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

        if (isUniswapV3LikeProvider(this.provider) || isAlgebraProvider(this.provider)) {
            return nativeIn ? CelerSwapMethod.SWAP_V3_NATIVE : CelerSwapMethod.SWAP_V3;
        }

        throw new RubicSdkError('Unknown swap method');
    }

    public abstract getCelerSourceTrade(): unknown[] | unknown;

    public abstract getCelerDestinationTrade(
        integratorAddress: string,
        receiverAddress: string
    ): unknown[];
}
