import { CrossChainSupportedInstantTradeProvider } from '@features/cross-chain/providers/common/celer-rubic/models/cross-chain-supported-instant-trade';
import { ProviderData } from '@features/cross-chain/models/provider-data';
import { Injector } from '@core/sdk/injector';
import { BlockchainName, PriceToken, PriceTokenAmount, Token, Web3Public } from 'src/core';
import BigNumber from 'bignumber.js';
import { RubicSdkError } from 'src/common';

export abstract class CrossChainContractData {
    protected readonly web3Public: Web3Public;

    protected constructor(
        public readonly providersData: ProviderData[],
        public readonly blockchain: BlockchainName,
        public readonly address: string
    ) {
        this.web3Public = Injector.web3PublicService.getWeb3Public(blockchain);
    }

    public getProvider(providerIndex: number): CrossChainSupportedInstantTradeProvider {
        const provider = this.providersData?.[providerIndex]?.provider;
        if (!provider) {
            throw new RubicSdkError('Provider has to be defined');
        }
        return provider;
    }

    public abstract getNumOfBlockchain(): Promise<number>;

    public abstract isPaused(): Promise<boolean>;

    public abstract getTransitToken(from?: PriceToken): Promise<Token>;

    public abstract getCryptoFeeToken(
        toContract: CrossChainContractData
    ): Promise<PriceTokenAmount>;

    public abstract getFeeInPercents(fromContract: CrossChainContractData): Promise<number>;

    public abstract getMaxGasPrice(): Promise<BigNumber>;

    public abstract getMinOrMaxTransitTokenAmount(
        type: 'min' | 'max',
        tokenAddress?: string
    ): Promise<string>;
}
