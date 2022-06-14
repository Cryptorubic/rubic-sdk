import { CrossChainContractTrade } from '@features/cross-chain/providers/common/celer-rubic/cross-chain-contract-trade';
import { AbiItem } from 'web3-utils';
import { UniswapV2AbstractProvider } from 'src/features';
import { crossChainContractAbiV2 } from '@features/cross-chain/providers/rubic-trade-provider/rubic-cross-chain-contract-trade/constants/cross-chain-contract-abi-v2';
import { UniswapV3AlgebraAbstractProvider } from '@features/instant-trades/dexes/common/uniswap-v3-algebra-abstract/uniswap-v3-algebra-abstract-provider';
import { crossChainContractAbiV3 } from '@features/cross-chain/providers/rubic-trade-provider/rubic-cross-chain-contract-trade/constants/cross-chain-contract-abi-v3';
import { crossChainContractAbiInch } from '@features/cross-chain/providers/rubic-trade-provider/rubic-cross-chain-contract-trade/constants/cross-chain-contract-abi-inch';
import { BlockchainName, Web3Pure } from 'src/core';
import { RubicCrossChainContractData } from '@features/cross-chain/providers/rubic-trade-provider/rubic-cross-chain-contract-trade/common/rubic-cross-chain-contract-data';

enum TO_OTHER_BLOCKCHAIN_SWAP_METHOD {
    SWAP_TOKENS = 'swapTokensToOtherBlockchain',
    SWAP_CRYPTO = 'swapCryptoToOtherBlockchain'
}

enum TO_USER_SWAP_METHOD {
    SWAP_TOKENS = 'swapTokensToUserWithFee',
    SWAP_CRYPTO = 'swapCryptoToUserWithFee'
}

export abstract class RubicCrossChainContractTrade extends CrossChainContractTrade {
    protected constructor(
        blockchain: BlockchainName,
        public readonly contract: RubicCrossChainContractData,
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
        let methodName: string = this.fromToken.isNative
            ? TO_OTHER_BLOCKCHAIN_SWAP_METHOD.SWAP_CRYPTO
            : TO_OTHER_BLOCKCHAIN_SWAP_METHOD.SWAP_TOKENS;
        const contractAbiMethod = this.getAbiMethodByProvider(methodName);

        methodName += this.providerData.methodSuffix;
        contractAbiMethod.name = methodName;

        return {
            methodName,
            contractAbi: [contractAbiMethod]
        };
    }

    private getAbiMethodByProvider(methodName: string): AbiItem {
        if (this.provider instanceof UniswapV2AbstractProvider) {
            return {
                ...crossChainContractAbiV2.find(method => method.name === methodName)!
            };
        }

        if (this.provider instanceof UniswapV3AlgebraAbstractProvider) {
            return {
                ...crossChainContractAbiV3.find(method => method.name!.startsWith(methodName))!
            };
        }

        return {
            ...crossChainContractAbiInch.find(method => method.name!.startsWith(methodName))!
        };
    }

    /**
     * Returns method's arguments to use in source network.
     */
    public async getMethodArguments(
        toContractTrade: CrossChainContractTrade,
        walletAddress: string,
        providerAddress: string,
        options: {
            swapTokenWithFee: boolean;
        } = { swapTokenWithFee: false }
    ): Promise<unknown[]> {
        const toNumOfBlockchain = await toContractTrade.contract.getNumOfBlockchain();

        const tokenInAmountAbsolute = this.fromToken.stringWeiAmount;

        const firstPath = this.getFirstPath();

        const secondPath = toContractTrade.getSecondPath();

        const fromTransitTokenAmountMinAbsolute = Web3Pure.toWei(
            this.toTokenAmountMin,
            this.toToken.decimals
        );

        const tokenOutAmountMinAbsolute = Web3Pure.toWei(
            toContractTrade.toTokenAmountMin,
            toContractTrade.toToken.decimals
        );

        const toWalletAddressBytes32 = Web3Pure.addressToBytes32(walletAddress);

        const isToTokenNative = this.toToken.isNative;

        const swapToUserMethodSignature = toContractTrade.getSwapToUserMethodSignature();

        const methodArguments = [
            [
                toNumOfBlockchain,
                tokenInAmountAbsolute,
                firstPath,
                secondPath,
                fromTransitTokenAmountMinAbsolute,
                tokenOutAmountMinAbsolute,
                toWalletAddressBytes32,
                providerAddress,
                isToTokenNative
            ]
        ];

        await this.modifyArgumentsForProvider(
            methodArguments,
            this.contract.address,
            options.swapTokenWithFee
        );

        if (!methodArguments?.[0]) {
            throw new Error('[RUBIC SDK] Method arguments have to be defined.');
        }

        methodArguments[0].push(swapToUserMethodSignature);

        return methodArguments;
    }

    /**
     * Returns swap method name in target network.
     * Must be called on target contract.
     */
    public getSwapToUserMethodSignature(): string {
        let methodName: string = this.toToken.isNative
            ? TO_USER_SWAP_METHOD.SWAP_CRYPTO
            : TO_USER_SWAP_METHOD.SWAP_TOKENS;

        methodName += this.providerData.methodSuffix;

        return methodName;
    }
}
