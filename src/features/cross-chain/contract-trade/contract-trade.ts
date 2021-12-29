import { CrossChainSupportedBlockchain } from '@features/cross-chain/constants/cross-chain-supported-blockchains';
import { CrossChainContractData } from '@features/cross-chain/contract-data/cross-chain-contract-data';
import BigNumber from 'bignumber.js';
import { PriceTokenAmount } from '@core/blockchain/tokens/price-token-amount';
import { Token } from '@core/blockchain/tokens/token';
import { AbiItem } from 'web3-utils';
import { crossChainContractAbiV2 } from '@features/cross-chain/contract-trade/constants/cross-chain-contract-abi-v2';
import { BLOCKCHAIN_NAME, Web3Pure } from 'src/core';
import { Pure } from 'src/common';
import { ProviderData } from '@features/cross-chain/contract-data/models/provider-data';
import { UniswapV2AbstractProvider } from 'src/features';

enum TO_OTHER_BLOCKCHAIN_SWAP_METHOD {
    SWAP_TOKENS = 'swapTokensToOtherBlockchain',
    SWAP_CRYPTO = 'swapCryptoToOtherBlockchain'
}

enum TO_USER_SWAP_METHOD {
    SWAP_TOKENS = 'swapTokensToUserWithFee',
    SWAP_CRYPTO = 'swapCryptoToUserWithFee'
}

export abstract class ContractTrade {
    public abstract readonly fromToken: PriceTokenAmount;

    public abstract readonly toToken: PriceTokenAmount;

    public abstract readonly toTokenAmountMin: BigNumber;

    public abstract readonly path: ReadonlyArray<Token>;

    @Pure
    public get provider(): UniswapV2AbstractProvider {
        return this.contract.providersData[this.providerIndex].provider;
    }

    @Pure
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
        const contractAbiMethod = {
            ...crossChainContractAbiV2.find(method => method.name === methodName)!
        };

        if (this.blockchain === BLOCKCHAIN_NAME.AVALANCHE) {
            methodName += 'AVAX';
        }

        methodName += this.providerData.methodSuffix;
        contractAbiMethod.name = methodName;

        return {
            methodName,
            contractAbi: [contractAbiMethod]
        };
    }

    /**
     * Returns method's arguments to use in source network.
     */
    public async getMethodArguments(
        toContractTrade: ContractTrade,
        walletAddress: string
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
            this.toToken.decimals
        );

        const walletAddressBytes32 = Web3Pure.addressToBytes32(walletAddress);

        const isToTokenNative = this.toToken.isNative;

        const useExactInputMethod = true;

        // TODO: add processing of tokens with fee
        const useSupportingFeeMethod = false;

        const swapToUserMethodSignature = toContractTrade.getSwapToUserMethodSignature();

        return [
            [
                toNumOfBlockchain,
                tokenInAmountAbsolute,
                firstPath,
                secondPath,
                fromTransitTokenAmountMinAbsolute,
                tokenOutAmountMinAbsolute,
                walletAddressBytes32,
                isToTokenNative,
                useExactInputMethod,
                useSupportingFeeMethod,
                swapToUserMethodSignature
            ]
        ];
    }

    /**
     * Returns `first path` method argument, converted from instant-trade data and chosen provider.
     * Must be called on source contract.
     */
    protected abstract getFirstPath(): string[];

    /**
     * Returns `second path` method argument, converted from instant-trade data and chosen provider.
     * Must be called on target contract.
     */
    protected abstract getSecondPath(): string[];

    /**
     * Returns `signature` method argument, build from function name and its arguments.
     * Example: `${function_name_in_target_network}(${arguments})`.
     * Must be called on target contract.
     */
    public getSwapToUserMethodSignature(): string {
        let methodName: string = this.toToken.isNative
            ? TO_USER_SWAP_METHOD.SWAP_CRYPTO
            : TO_USER_SWAP_METHOD.SWAP_TOKENS;
        const contractAbiMethod = crossChainContractAbiV2.find(
            method => method.name === methodName
        )!;

        if (this.blockchain === BLOCKCHAIN_NAME.AVALANCHE) {
            methodName += 'AVAX';
        }

        methodName += this.providerData.methodSuffix;

        const methodArgumentsSignature = this.getArgumentsSignature(contractAbiMethod);

        return methodName + methodArgumentsSignature;
    }

    /**
     * Returns signature of arguments of cross-chain swap method.
     * @param contractAbiMethod Swap method in cross-chain contract.
     */
    private getArgumentsSignature(contractAbiMethod: AbiItem): string {
        const parameters = contractAbiMethod.inputs![0].components!;
        return parameters.reduce((acc, parameter, index) => {
            if (index === 0) {
                acc = '((';
            }

            acc += parameter.type;

            if (index === parameters.length - 1) {
                return `${acc}))`;
            }
            return `${acc},`;
        }, '');
    }
}
