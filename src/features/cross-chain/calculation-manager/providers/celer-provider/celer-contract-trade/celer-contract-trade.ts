import BigNumber from 'bignumber.js';
import { RubicSdkError } from 'src/common/errors';
import { PriceTokenAmount } from 'src/common/tokens';
import { Cache } from 'src/common/utils/decorators';
import { EvmBlockchainName } from 'src/core/blockchain/models/blockchain-name';
import { CelerCrossChainContractData } from 'src/features/cross-chain/calculation-manager/providers/celer-provider/celer-cross-chain-contract-data';
import { celerCrossChainContractAbi } from 'src/features/cross-chain/calculation-manager/providers/celer-provider/constants/celer-cross-chain-contract-abi';
import { CelerSwapMethod } from 'src/features/cross-chain/calculation-manager/providers/celer-provider/constants/celer-swap-methods';
import { CelerCrossChainSupportedBlockchain } from 'src/features/cross-chain/calculation-manager/providers/celer-provider/models/celer-cross-chain-supported-blockchain';
import { CelerSupportedOnChainTradeProvider } from 'src/features/cross-chain/calculation-manager/providers/celer-provider/models/celer-supported-on-chain-trade';
import {
    isAlgebraProvider,
    isOneInchLikeProvider,
    isUniswapV2LikeProvider,
    isUniswapV3LikeProvider
} from 'src/features/on-chain/calculation-manager/utils/type-guards';
import { AbiItem } from 'web3-utils';

export abstract class CelerContractTrade {
    public abstract readonly fromToken: PriceTokenAmount<EvmBlockchainName>;

    public abstract readonly toToken: PriceTokenAmount<EvmBlockchainName>;

    public abstract readonly toTokenAmountMin: BigNumber;

    @Cache
    public get provider(): CelerSupportedOnChainTradeProvider {
        const provider = this.contract.providersData?.[this.providerIndex]?.provider;
        if (!provider) {
            throw new RubicSdkError('Provider has to be defined');
        }
        return provider;
    }

    protected constructor(
        public readonly blockchain: CelerCrossChainSupportedBlockchain,
        public readonly contract: CelerCrossChainContractData,
        private readonly providerIndex: number
    ) {}

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

    public abstract getMethodArguments(
        toContractTrade: CelerContractTrade,
        walletAddress: string,
        providerAddress: string,
        options?: {
            swapTokenWithFee?: boolean;
            maxSlippage?: number;
            receiverAddress?: string;
        }
    ): Promise<unknown[]>;

    public abstract getCelerSourceTrade(): unknown[] | unknown;

    public abstract getCelerDestinationTrade(
        integratorAddress: string,
        receiverAddress: string
    ): unknown[];
}
