import { CelerCrossChainSupportedBlockchain } from 'src/features/cross-chain/providers/celer-trade-provider/models/celer-cross-chain-supported-blockchain';
import { BlockchainName, EvmBlockchainName } from 'src/core/blockchain/models/blockchain-name';
import { celerCrossChainContractAbi } from 'src/features/cross-chain/providers/celer-trade-provider/constants/celer-cross-chain-contract-abi';
import { PriceTokenAmount, Token } from 'src/common/tokens';
import { ProviderData } from 'src/features/cross-chain/providers/celer-trade-provider/models/provider-data';
import { CelerMessageBusController } from 'src/features/cross-chain/providers/celer-trade-provider/celer-message-bus-controller/celer-message-bus-controller';
import { celerTransitTokens } from 'src/features/cross-chain/providers/celer-trade-provider/constants/celer-transit-tokens';
import { Cache } from 'src/common/utils/decorators';
import { nativeTokensList } from 'src/common/tokens/constants/native-tokens';
import BigNumber from 'bignumber.js';
import { blockchainId } from 'src/core/blockchain/utils/blockchains-info/constants/blockchain-id';
import { CrossChainSupportedInstantTradeProvider } from 'src/features/cross-chain/providers/celer-trade-provider/models/cross-chain-supported-instant-trade';
import { RubicSdkError } from 'src/common/errors';
import { Injector } from 'src/core/injector/injector';

/**
 * Class to work with readable methods of cross-chain contract.
 */
export class CelerCrossChainContractData {
    private readonly web3Public = Injector.web3PublicService.getWeb3Public(this.blockchain);

    private readonly messageBusController = new CelerMessageBusController(this.web3Public);

    constructor(
        public readonly blockchain: CelerCrossChainSupportedBlockchain,
        public readonly address: string,
        public readonly providersData: ProviderData[]
    ) {}

    public getProvider(providerIndex: number): CrossChainSupportedInstantTradeProvider {
        const provider = this.providersData?.[providerIndex]?.provider;
        if (!provider) {
            throw new RubicSdkError('Provider has to be defined');
        }
        return provider;
    }

    public async destinationCryptoFee(toBlockchain: BlockchainName): Promise<BigNumber> {
        const destinationBlockchainId = blockchainId[toBlockchain];
        return this.web3Public.callContractMethod(
            this.address,
            celerCrossChainContractAbi,
            'blockchainToGasFee',
            [String(destinationBlockchainId)]
        );
    }

    public async getMinMaxTransitTokenAmounts(tokenAddress: string): Promise<[string, string]> {
        return (
            await this.web3Public.multicallContractMethods<[string]>(
                this.address,
                celerCrossChainContractAbi,
                [
                    {
                        methodName: 'minTokenAmount',
                        methodArguments: [tokenAddress]
                    },
                    {
                        methodName: 'maxTokenAmount',
                        methodArguments: [tokenAddress]
                    }
                ]
            )
        ).map(result => result.output![0] as string) as [string, string];
    }

    @Cache
    public async getTransitToken(): Promise<Token<EvmBlockchainName>> {
        const address = this.getTransitTokenAddressBasedOnBlockchain(this.blockchain);
        return Token.createToken({
            address,
            blockchain: this.blockchain
        });
    }

    public isPaused(): Promise<boolean> {
        return this.web3Public.callContractMethod<boolean>(
            this.address,
            celerCrossChainContractAbi,
            'paused'
        );
    }

    public messageBusAddress(): Promise<string> {
        return this.web3Public.callContractMethod(
            this.address,
            celerCrossChainContractAbi,
            'messageBus'
        );
    }

    public celerFeePerByte(message: string, messageBusAddress: string): Promise<string> {
        return this.messageBusController.getCalcFee(message, messageBusAddress);
    }

    public celerFeeBase(messageBusAddress: string): Promise<string> {
        return this.messageBusController.getFeeBase(messageBusAddress);
    }

    private getTransitTokenAddressBasedOnBlockchain(
        blockchain: CelerCrossChainSupportedBlockchain
    ): string {
        return celerTransitTokens[blockchain].address;
    }

    public async getFeeInPercents(): Promise<number> {
        const feeAbsolute = await this.web3Public.callContractMethod(
            this.address,
            celerCrossChainContractAbi,
            'RubicPlatformFee'
        );
        return Number(feeAbsolute) / 10_000;
    }

    public async getCryptoFeeToken(
        toContract: CelerCrossChainContractData
    ): Promise<PriceTokenAmount<EvmBlockchainName>> {
        const feeAmount = await this.destinationCryptoFee(toContract.blockchain);
        const nativeToken = nativeTokensList[this.blockchain];
        return PriceTokenAmount.createFromToken({
            ...nativeToken,
            weiAmount: feeAmount
        });
    }
}
