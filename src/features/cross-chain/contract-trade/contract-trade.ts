import { CrossChainSupportedBlockchain } from '@features/cross-chain/constants/cross-chain-supported-blockchains';
import { ContractData } from '@features/cross-chain/contract-data/contract-data';
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
    public abstract get fromToken(): PriceTokenAmount;

    public abstract get toToken(): PriceTokenAmount;

    public abstract get toTokenAmountMin(): BigNumber;

    public abstract get path(): ReadonlyArray<Token>;

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
        public readonly contract: ContractData,
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
    public getMethodArguments(toContractTrade: ContractTrade, walletAddress: string): unknown[] {
        const tokenInAmountAbsolute = this.fromToken.weiAmount;
        const tokenOutAmountMinAbsolute = Web3Pure.toWei(
            toContractTrade.toTokenAmountMin,
            this.toToken.decimals
        );

        const fromTransitTokenAmountMinAbsolute = Web3Pure.toWei(
            this.toTokenAmountMin,
            this.toToken.decimals
        );

        const toNumOfBlockchain = toContractTrade.contract.getNumOfBlockchain();

        const firstPath = this.getFirstPath();
        const secondPath = toContractTrade.getSecondPath();

        const swapToUserMethodSignature = toContractTrade.getSwapToUserMethodSignature();

        return [
            [
                toNumOfBlockchain,
                tokenInAmountAbsolute,
                firstPath,
                secondPath,
                fromTransitTokenAmountMinAbsolute,
                tokenOutAmountMinAbsolute,
                Web3Pure.addressToBytes32(walletAddress),
                this.toToken.isNative,
                true,
                false,
                swapToUserMethodSignature
            ]
        ];
    }

    /**
     * Returns `first path` method argument, converted from instant-trade data and chosen provider.
     * Must be called on source contract.
     */
    public abstract getFirstPath(): string[];

    /**
     * Returns `second path` method argument, converted from instant-trade data and chosen provider.
     * Must be called on target contract.
     */
    public abstract getSecondPath(): string[];

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

        const parameters = contractAbiMethod.inputs![0].components!;
        const paramsSignature = parameters.reduce((acc, parameter, index) => {
            if (index === 0) {
                acc = '((';
            }

            acc += parameter.type;

            if (index === parameters.length - 1) {
                return `${acc}))`;
            }
            return `${acc},`;
        }, '');

        return methodName + paramsSignature;
    }
}
