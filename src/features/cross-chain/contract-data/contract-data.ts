import { BLOCKCHAIN_NAME } from '@core/blockchain/models/BLOCKCHAIN_NAME';
import { Web3Public } from '@core/blockchain/web3-public/web3-public';
import { Injector } from '@core/sdk/injector';
import { PCache } from '@common/decorators/cache.decorator';
import { Token } from '@core/blockchain/tokens/token';
import { PriceTokenAmount } from '@core/blockchain/tokens/price-token-amount';
import BigNumber from 'bignumber.js';
import { BlockchainsInfo } from '@core/blockchain/blockchains-info';
import { crossChainContractAbi } from '@features/cross-chain/constants/cross-chain-contract-abi';
import { UniswapV2AbstractProvider } from '@features/swap/dexes/common/uniswap-v2-abstract/uniswap-v2-abstract-provider';

export class ContractData {
    private readonly web3Public: Web3Public;

    constructor(
        private readonly blockchain: BLOCKCHAIN_NAME,
        public readonly address: string,
        public readonly uniswapV2Provider: UniswapV2AbstractProvider
    ) {
        this.web3Public = Injector.web3PublicService.getWeb3Public(blockchain);
    }

    @PCache
    public async getNumOfContract(): Promise<number> {
        const numOfContract = await this.web3Public.callContractMethod(
            this.address,
            crossChainContractAbi,
            'numOfThisBlockchain'
        );
        return parseInt(numOfContract);
    }

    @PCache
    public async getTransitToken(): Promise<Token> {
        const numOfContract = await this.getNumOfContract();
        const transitTokenAddress = await this.web3Public.callContractMethod(
            this.address,
            crossChainContractAbi,
            'RubicAddresses',
            {
                methodArguments: [numOfContract]
            }
        );
        return Token.createToken({
            address: transitTokenAddress,
            blockchain: this.blockchain
        });
    }

    public async getFeeInPercents(): Promise<number> {
        const numOfContract = await this.getNumOfContract();
        const feeAbsolute = await this.web3Public.callContractMethod(
            this.address,
            crossChainContractAbi,
            'feeAmountOfBlockchain',
            {
                methodArguments: [numOfContract]
            }
        );
        return parseInt(feeAbsolute) / 10000;
    }

    public async getCryptoFeeToken(toContract: ContractData): Promise<PriceTokenAmount> {
        const numOfToContract = await toContract.getNumOfContract();
        const feeAmount = new BigNumber(
            await this.web3Public.callContractMethod(
                this.address,
                crossChainContractAbi,
                'blockchainCryptoFee',
                {
                    methodArguments: [numOfToContract]
                }
            )
        );
        const nativeToken = BlockchainsInfo.getBlockchainByName(this.blockchain).nativeCoin;
        return PriceTokenAmount.createFromToken({
            ...nativeToken,
            weiAmount: feeAmount
        });
    }

    public getMinOrMaxTransitTokenAmount(type: 'minAmount' | 'maxAmount'): Promise<string> {
        return this.web3Public.callContractMethod(
            this.address,
            crossChainContractAbi,
            type === 'minAmount' ? 'minTokenAmount' : 'maxTokenAmount'
        );
    }

    public isContractPaused(): Promise<boolean> {
        return this.web3Public.callContractMethod<boolean>(
            this.address,
            crossChainContractAbi,
            'paused'
        );
    }

    public async getMaxGasPrice(): Promise<BigNumber> {
        return new BigNumber(
            await this.web3Public.callContractMethod(
                this.address,
                crossChainContractAbi,
                'maxGasPrice'
            )
        );
    }
}
