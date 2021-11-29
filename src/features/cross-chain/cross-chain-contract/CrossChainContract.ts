import { BLOCKCHAIN_NAME } from '@core/blockchain/models/BLOCKCHAIN_NAME';
import { Web3Public } from '@core/blockchain/web3-public/web3-public';
import { Injector } from '@core/sdk/injector';
import { PCache } from '@common/decorators/cache.decorator';
import crossChainContractAbi from '@features/cross-chain/cross-chain-contract/constants/crossChainContractAbi';
import { Token } from '@core/blockchain/tokens/token';
import { PriceTokenAmount } from '@core/blockchain/tokens/price-token-amount';
import BigNumber from 'bignumber.js';
import { BlockchainsInfo } from '@core/blockchain/blockchains-info';
import { UniswapV2LikeProvider } from '@features/swap/providers/common/uniswap-v2/uniswap-v2-like-provider';

export class CrossChainContract {
    private readonly web3Public: Web3Public;

    constructor(
        private readonly blockchain: BLOCKCHAIN_NAME,
        public readonly address: string,
        public readonly uniswapV2Provider: UniswapV2LikeProvider
    ) {
        this.web3Public = Injector.web3PublicService.getWeb3Public(blockchain);
    }

    @PCache
    public async getNumOfContract(): Promise<number> {
        const numOfContract = (await this.web3Public.callContractMethod(
            this.address,
            crossChainContractAbi,
            'numOfThisBlockchain'
        )) as string;
        return parseInt(numOfContract);
    }

    @PCache
    public async getTransitToken(): Promise<Token> {
        const numOfContract = await this.getNumOfContract();
        const transitTokenAddress = (await this.web3Public.callContractMethod(
            this.address,
            crossChainContractAbi,
            'RubicAddresses',
            {
                methodArguments: [numOfContract]
            }
        )) as string;
        return Token.createToken({
            address: transitTokenAddress,
            blockchain: this.blockchain
        });
    }

    public async getFeeInPercents(): Promise<number> {
        const numOfContract = await this.getNumOfContract();
        const feeAbsolute = (await this.web3Public.callContractMethod(
            this.address,
            crossChainContractAbi,
            'feeAmountOfBlockchain',
            {
                methodArguments: [numOfContract]
            }
        )) as string;
        return parseInt(feeAbsolute) / 10000;
    }

    public async getCryptoFeeToken(toContract: CrossChainContract): Promise<PriceTokenAmount> {
        const numOfToContract = await toContract.getNumOfContract();
        const feeAmount = new BigNumber(
            (await this.web3Public.callContractMethod(
                this.address,
                crossChainContractAbi,
                'blockchainCryptoFee',
                {
                    methodArguments: [numOfToContract]
                }
            )) as string
        );
        const nativeToken = BlockchainsInfo.getBlockchainByName(this.blockchain).nativeCoin;
        return PriceTokenAmount.createTokenFromToken({
            ...nativeToken,
            weiAmount: feeAmount
        });
    }
}
