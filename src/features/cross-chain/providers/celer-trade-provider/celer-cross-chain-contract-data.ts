import { BlockchainName } from '@core/blockchain/models/blockchain-name';
import { PriceTokenAmount } from '@core/blockchain/tokens/price-token-amount';
import { ProviderData } from '@features/cross-chain/models/provider-data';
import { CrossChainContractData } from '@features/cross-chain/providers/common/cross-chain-contract-data';
import { celerCrossChainContractAbi } from '@features/cross-chain/providers/celer-trade-provider/constants/celer-cross-chain-contract-abi';
import { BlockchainsInfo, PriceToken } from 'src/core';
import { CellerMessageBusController } from '@features/cross-chain/providers/celer-trade-provider/celer-message-bus-controller/celler-message-bus-controller';
import { Cache } from 'src/common';
import { Token } from '@core/blockchain/tokens/token';
import { rubicCrossChainContractAbi } from '@features/cross-chain/providers/rubic-trade-provider/constants/rubic-cross-chain-contract-abi';
import BigNumber from 'bignumber.js';

import { CelerCrossChainSupportedBlockchain } from '@features/cross-chain/providers/celer-trade-provider/constants/celer-cross-chain-supported-blockchain';
import { celerTransitTokens } from '@features/cross-chain/providers/celer-trade-provider/constants/celer-transit-tokens';

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
            'dstCryptoFee',
            {
                methodArguments: [String(destinationBlockchainId)]
            }
        );
    }

    public getMinOrMaxTransitTokenAmount(
        type: 'min' | 'max',
        tokenAddress: string
    ): Promise<string> {
        return this.web3Public.callContractMethod(
            this.address,
            celerCrossChainContractAbi,
            type === 'min' ? 'minSwapAmount' : 'maxSwapAmount',
            { methodArguments: [tokenAddress] }
        );
    }

    @Cache
    public async getTransitToken(from: PriceToken): Promise<Token> {
        const blockchain = from.blockchain as CelerCrossChainSupportedBlockchain;
        const address = this.getTransitTokenAddressBasedOnToken(blockchain);
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

    private getTransitTokenAddressBasedOnToken(
        blockchain: CelerCrossChainSupportedBlockchain
    ): string {
        return celerTransitTokens[blockchain].address;
    }

    public async getFeeInPercents(fromContract: CrossChainContractData): Promise<number> {
        const numOfFromBlockchain = await fromContract.getNumOfBlockchain();
        const feeAbsolute = await this.web3Public.callContractMethod(
            this.mainContractAddress,
            rubicCrossChainContractAbi,
            'feeAmountOfBlockchain',
            {
                methodArguments: [numOfFromBlockchain]
            }
        );
        return parseInt(feeAbsolute) / 10000;
    }

    public async getCryptoFeeToken(
        toContract: CelerCrossChainContractData
    ): Promise<PriceTokenAmount> {
        const numOfToBlockchain = await toContract.getNumOfBlockchain();
        const feeAmount = new BigNumber(
            await this.web3Public.callContractMethod(
                this.mainContractAddress,
                rubicCrossChainContractAbi,
                'blockchainCryptoFee',
                {
                    methodArguments: [numOfToBlockchain]
                }
            )
        );
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
