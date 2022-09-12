import { CrossChainSupportedInstantTradeProvider } from 'src/features/cross-chain/providers/common/celer-rubic/models/cross-chain-supported-instant-trade';
import { ProviderData } from 'src/features/cross-chain/models/provider-data';
import { Injector } from 'src/core/sdk/injector';
import BigNumber from 'bignumber.js';
import { PriceToken, PriceTokenAmount, Token } from 'src/common/tokens';
import { EvmWeb3Public } from 'src/core/blockchain/web3-public-service/web3-public/evm-web3-public';
import { EvmBlockchainName } from 'src/core/blockchain/models/blockchain-name';
import { RubicSdkError } from 'src/common/errors';

export abstract class CrossChainContractData {
    protected readonly web3Public: EvmWeb3Public;

    protected constructor(
        public readonly providersData: ProviderData[],
        public readonly blockchain: EvmBlockchainName,
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

    public abstract getTransitToken(
        from?: PriceToken<EvmBlockchainName>
    ): Promise<Token<EvmBlockchainName>>;

    public abstract getCryptoFeeToken(
        toContract: CrossChainContractData
    ): Promise<PriceTokenAmount>;

    public abstract getFeeInPercents(fromContract?: CrossChainContractData): Promise<number>;

    public abstract getMaxGasPrice(): Promise<BigNumber>;

    public abstract getMinMaxTransitTokenAmounts(tokenAddress?: string): Promise<[string, string]>;
}
