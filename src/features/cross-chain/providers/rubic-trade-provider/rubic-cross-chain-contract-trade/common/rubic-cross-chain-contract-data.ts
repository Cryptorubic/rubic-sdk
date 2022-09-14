/**
 * Class to work with readable methods of cross-chain contract.
 */ import { ProviderData } from 'src/features/cross-chain/models/provider-data';
import { CrossChainContractData } from 'src/features/cross-chain/providers/common/celer-rubic/cross-chain-contract-data';
import { EvmBlockchainName } from 'src/core/blockchain/models/blockchain-name';
import { rubicCrossChainContractAbi } from 'src/features/cross-chain/providers/rubic-trade-provider/constants/rubic-cross-chain-contract-abi';
import { PriceTokenAmount, Token } from 'src/common/tokens';
import { Cache } from 'src/common/utils/decorators';
import { nativeTokensList } from 'src/common/tokens/constants/native-tokens';
import BigNumber from 'bignumber.js';

export class RubicCrossChainContractData extends CrossChainContractData {
    constructor(
        public readonly blockchain: EvmBlockchainName,
        public readonly address: string,
        public readonly providersData: ProviderData[]
    ) {
        super(providersData, blockchain, address);
    }

    @Cache
    public async getNumOfBlockchain(): Promise<number> {
        const numOfBlockchain = await this.web3Public.callContractMethod(
            this.address,
            rubicCrossChainContractAbi,
            'numOfThisBlockchain'
        );
        return parseInt(numOfBlockchain);
    }

    @Cache
    public async getTransitToken(): Promise<Token<EvmBlockchainName>> {
        const numOfBlockchain = await this.getNumOfBlockchain();
        const transitTokenAddress = await this.web3Public.callContractMethod(
            this.address,
            rubicCrossChainContractAbi,
            'RubicAddresses',
            [numOfBlockchain]
        );
        return Token.createToken({
            address: transitTokenAddress,
            blockchain: this.blockchain
        });
    }

    public async getFeeInPercents(fromContract: CrossChainContractData): Promise<number> {
        const numOfFromBlockchain = await fromContract.getNumOfBlockchain();
        const feeAbsolute = await this.web3Public.callContractMethod(
            this.address,
            rubicCrossChainContractAbi,
            'feeAmountOfBlockchain',
            [numOfFromBlockchain]
        );
        return parseInt(feeAbsolute) / 10000;
    }

    public async getCryptoFeeToken(
        toContract: RubicCrossChainContractData
    ): Promise<PriceTokenAmount> {
        const numOfToBlockchain = await toContract.getNumOfBlockchain();
        const feeAmount = new BigNumber(
            await this.web3Public.callContractMethod(
                this.address,
                rubicCrossChainContractAbi,
                'blockchainCryptoFee',
                [numOfToBlockchain]
            )
        );
        const nativeToken = nativeTokensList[this.blockchain];
        return PriceTokenAmount.createFromToken({
            ...nativeToken,
            weiAmount: feeAmount
        });
    }

    public async getMinMaxTransitTokenAmounts(): Promise<[string, string]> {
        return (
            await this.web3Public.multicallContractMethods<[string]>(
                this.address,
                rubicCrossChainContractAbi,
                [
                    {
                        methodName: 'minTokenAmount',
                        methodArguments: []
                    },
                    {
                        methodName: 'maxTokenAmount',
                        methodArguments: []
                    }
                ]
            )
        ).map(result => result.output![0] as string) as [string, string];
    }

    public isPaused(): Promise<boolean> {
        return this.web3Public.callContractMethod<boolean>(
            this.address,
            rubicCrossChainContractAbi,
            'paused'
        );
    }

    public async getMaxGasPrice(): Promise<BigNumber> {
        return new BigNumber(
            await this.web3Public.callContractMethod(
                this.address,
                rubicCrossChainContractAbi,
                'maxGasPrice'
            )
        );
    }
}
