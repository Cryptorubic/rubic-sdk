import { BlockchainName } from '@rsdk-core/blockchain/models/blockchain-name';
import { PriceTokenAmount } from '@rsdk-core/blockchain/tokens/price-token-amount';
import { ProviderData } from '@rsdk-features/cross-chain/models/provider-data';
import { CrossChainContractData } from '@rsdk-features/cross-chain/providers/common/celer-rubic/cross-chain-contract-data';
import { celerCrossChainContractAbi } from '@rsdk-features/cross-chain/providers/celer-trade-provider/constants/celer-cross-chain-contract-abi';
import { BlockchainsInfo, PriceToken } from 'src/core';
import { CellerMessageBusController } from '@rsdk-features/cross-chain/providers/celer-trade-provider/celer-message-bus-controller/celler-message-bus-controller';
import { Cache } from '@rsdk-common/decorators/cache.decorator';
import { Token } from '@rsdk-core/blockchain/tokens/token';
import { rubicCrossChainContractAbi } from '@rsdk-features/cross-chain/providers/rubic-trade-provider/constants/rubic-cross-chain-contract-abi';
import BigNumber from 'bignumber.js';

import { CelerCrossChainSupportedBlockchain } from '@rsdk-features/cross-chain/providers/celer-trade-provider/constants/celer-cross-chain-supported-blockchain';
import { celerTransitTokens } from '@rsdk-features/cross-chain/providers/celer-trade-provider/constants/celer-transit-tokens';

/**
 * Class to work with readable methods of cross-chain contract.
 */
export class CelerCrossChainContractData extends CrossChainContractData {
    private readonly messageBusController = new CellerMessageBusController(this.web3Public);

    constructor(
        public readonly blockchain: BlockchainName,
        public readonly address: string,
        public readonly providersData: ProviderData[],
        public readonly mainContractAddress: string
    ) {
        super(providersData, blockchain, address);
    }

    public async destinationCryptoFee(toBlockchain: BlockchainName): Promise<BigNumber> {
        const destinationBlockchainId = BlockchainsInfo.getBlockchainByName(toBlockchain).id;
        return this.web3Public.callContractMethod(
            this.address,
            celerCrossChainContractAbi,
            'blockchainToGasFee',
            {
                methodArguments: [String(destinationBlockchainId)]
            }
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
    public async getTransitToken(token: PriceToken): Promise<Token> {
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
    ): Promise<PriceTokenAmount> {
        const feeAmount = await this.destinationCryptoFee(toContract.blockchain);
        const nativeToken = BlockchainsInfo.getBlockchainByName(this.blockchain).nativeCoin;
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
