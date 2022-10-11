import BigNumber from 'bignumber.js';
import { PriceTokenAmount } from '@rsdk-core/blockchain/tokens/price-token-amount';
import { AbiItem } from 'web3-utils';
import { BlockchainName } from 'src/core';
import { RubicSdkError } from 'src/common';
import { Cache } from '@rsdk-common/decorators/cache.decorator';
import { ProviderData } from '@rsdk-features/cross-chain/models/provider-data';
import { CrossChainContractData } from '@rsdk-features/cross-chain/providers/common/celer-rubic/cross-chain-contract-data';
import { CrossChainSupportedInstantTradeProvider } from '@rsdk-features/cross-chain/providers/common/celer-rubic/models/cross-chain-supported-instant-trade';

export abstract class CrossChainContractTrade {
    public abstract readonly fromToken: PriceTokenAmount;

    public abstract readonly toToken: PriceTokenAmount;

    public abstract readonly toTokenAmountMin: BigNumber;

    public abstract readonly contract: CrossChainContractData;

    @Cache
    public get provider(): CrossChainSupportedInstantTradeProvider {
        const provider = this.contract.providersData?.[this.providerIndex]?.provider;
        if (!provider) {
            throw new RubicSdkError('Provider has to be defined');
        }
        return provider;
    }

    @Cache
    protected get providerData(): ProviderData {
        const providersData = this.contract.providersData?.[this.providerIndex];
        if (!providersData) {
            throw new RubicSdkError('Providers data has to be defined');
        }
        return providersData;
    }

    protected constructor(
        public readonly blockchain: BlockchainName,
        private readonly providerIndex: number
    ) {}

    public abstract getMethodNameAndContractAbi(): {
        methodName: string;
        contractAbi: AbiItem[];
    };

    public abstract getMethodArguments(
        toContractTrade: CrossChainContractTrade,
        walletAddress: string,
        providerAddress: string,
        options?: {
            swapTokenWithFee?: boolean;
            maxSlippage?: number;
            receiverAddress?: string;
        }
    ): Promise<unknown[]>;

    protected abstract modifyArgumentsForProvider(
        methodArguments: unknown[][],
        walletAddress: string,
        swapTokenWithFee?: boolean
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
    public abstract getSecondPath(): string[];

    public abstract getSwapToUserMethodSignature(): string;
}
