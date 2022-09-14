import { CelerCrossChainSupportedBlockchain } from 'src/features/cross-chain/providers/celer-trade-provider/constants/celer-cross-chain-supported-blockchain';
import { BlockchainName, EvmBlockchainName } from 'src/core/blockchain/models/blockchain-name';
import { celerCrossChainContractAbi } from 'src/features/cross-chain/providers/celer-trade-provider/constants/celer-cross-chain-contract-abi';
import { rubicCrossChainContractAbi } from 'src/features/cross-chain/providers/rubic-trade-provider/constants/rubic-cross-chain-contract-abi';
import { PriceToken, PriceTokenAmount, Token } from 'src/common/tokens';
import { ProviderData } from 'src/features/cross-chain/models/provider-data';
import { CrossChainContractData } from 'src/features/cross-chain/providers/common/celer-rubic/cross-chain-contract-data';
import { CellerMessageBusController } from 'src/features/cross-chain/providers/celer-trade-provider/celer-message-bus-controller/celler-message-bus-controller';
import { celerTransitTokens } from 'src/features/cross-chain/providers/celer-trade-provider/constants/celer-transit-tokens';
import { Cache } from 'src/common/utils/decorators';
import { nativeTokensList } from 'src/common/tokens/constants/native-tokens';
import BigNumber from 'bignumber.js';
import { blockchainId } from 'src/core/blockchain/utils/blockchains-info/constants/blockchain-id';

/**
 * Class to work with readable methods of cross-chain contract.
 */
export class CelerCrossChainContractData extends CrossChainContractData {
    private readonly messageBusController = new CellerMessageBusController(this.web3Public);

    constructor(
        public readonly blockchain: EvmBlockchainName,
        public readonly address: string,
        public readonly providersData: ProviderData[],
        public readonly mainContractAddress: string
    ) {
        super(providersData, blockchain, address);
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
    public async getTransitToken(
        token: PriceToken<EvmBlockchainName>
    ): Promise<Token<EvmBlockchainName>> {
        const blockchain = token.blockchain as CelerCrossChainSupportedBlockchain;
        const address = this.getTransitTokenAddressBasedOnBlockchain(blockchain);
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

    @Cache
    public async getNumOfBlockchain(): Promise<number> {
        const numOfBlockchain = await this.web3Public.callContractMethod(
            this.mainContractAddress,
            rubicCrossChainContractAbi,
            'numOfThisBlockchain'
        );
        return parseInt(numOfBlockchain);
    }

    public async getMaxGasPrice(): Promise<BigNumber> {
        return new BigNumber(
            await this.web3Public.callContractMethod(
                this.mainContractAddress,
                rubicCrossChainContractAbi,
                'maxGasPrice'
            )
        );
    }
}
