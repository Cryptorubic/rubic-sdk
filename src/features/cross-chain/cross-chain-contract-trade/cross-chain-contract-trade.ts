import { CrossChainSupportedBlockchain } from '@features/cross-chain/constants/cross-chain-supported-blockchains';
import { CrossChainContractData } from '@features/cross-chain/cross-chain-contract-data/cross-chain-contract-data';
import BigNumber from 'bignumber.js';
import { PriceTokenAmount } from '@core/blockchain/tokens/price-token-amount';
import { AbiItem } from 'web3-utils';
import { crossChainContractAbiV2 } from '@features/cross-chain/cross-chain-contract-trade/constants/cross-chain-contract-abi-v2';
import { Web3Pure } from 'src/core';
import { Cache } from 'src/common';
import { ProviderData } from '@features/cross-chain/cross-chain-contract-data/models/provider-data';
import { CrossChainSupportedInstantTradeProvider } from '@features/cross-chain/models/cross-chain-supported-instant-trade';
import { crossChainContractAbiV3 } from '@features/cross-chain/cross-chain-contract-trade/constants/cross-chain-contract-abi-v3';
import { UniswapV3AlgebraAbstractProvider } from '@features/instant-trades/dexes/common/uniswap-v3-algebra-abstract/uniswap-v3-algebra-abstract-provider';
import { UniswapV2AbstractProvider } from '@features/instant-trades/dexes/common/uniswap-v2-abstract/uniswap-v2-abstract-provider';
import { crossChainContractAbiInch } from '@features/cross-chain/cross-chain-contract-trade/constants/cross-chain-contract-abi-inch';

enum TO_OTHER_BLOCKCHAIN_SWAP_METHOD {
    SWAP_TOKENS = 'swapTokensToOtherBlockchain',
    SWAP_CRYPTO = 'swapCryptoToOtherBlockchain'
}

enum TO_USER_SWAP_METHOD {
    SWAP_TOKENS = 'swapTokensToUserWithFee',
    SWAP_CRYPTO = 'swapCryptoToUserWithFee'
}

export abstract class CrossChainContractTrade {
    public abstract readonly fromToken: PriceTokenAmount;

    public abstract readonly toToken: PriceTokenAmount;

    public abstract readonly toTokenAmountMin: BigNumber;

    @Cache
    public get provider(): CrossChainSupportedInstantTradeProvider {
        return this.contract.providersData[this.providerIndex].provider;
    }

    @Cache
    private get providerData(): ProviderData {
        return this.contract.providersData[this.providerIndex];
    }

    protected constructor(
        public readonly blockchain: CrossChainSupportedBlockchain,
        public readonly contract: CrossChainContractData,
        private readonly providerIndex: number
    ) {}

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
        providerAddress: string
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

        await this.modifyArgumentsForProvider(methodArguments, this.contract.address);

        methodArguments[0].push(swapToUserMethodSignature);

        return methodArguments;
    }

    protected abstract modifyArgumentsForProvider(
        methodArguments: unknown[][],
        walletAddress: string
    ): Promise<void>;

    /**
     * Returns `first path` method argument, converted from instant-trade data and chosen provider.
     * Must be called on source contract.
     */
    protected abstract getFirstPath(): string[] | string;

    /**
     * Returns `second path` method argument, converted from instant-trade data and chosen provider.
     * Must be called on target contract.
     */
    protected abstract getSecondPath(): string[];

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
