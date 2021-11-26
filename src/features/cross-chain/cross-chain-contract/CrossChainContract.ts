import { BLOCKCHAIN_NAME } from '@core/blockchain/models/BLOCKCHAIN_NAME';
import { InstantTrades } from '@features/swap/instant-trades';
import { Web3Public } from '@core/blockchain/web3-public/web3-public';
import { Injector } from '@core/sdk/injector';
import { PCache } from '@common/decorators/cache.decorator';
import crossChainContractAbi from '@features/cross-chain/cross-chain-contract/constants/crossChainContractAbi';
import { Token } from '@core/blockchain/tokens/token';
import { PriceToken } from '@core/blockchain/tokens/price-token';
import { PriceTokenAmount } from '@core/blockchain/tokens/price-token-amount';
import BigNumber from 'bignumber.js';
import { BlockchainsInfo } from '@core/blockchain/blockchains-info';

export class CrossChainContract {
    private readonly web3Public: Web3Public;

    constructor(
        private readonly blockchain: BLOCKCHAIN_NAME,
        public readonly address: string,
        public readonly uniswapProvider: InstantTrades
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

    public async getTransitToken(): Promise<PriceToken> {
        const baseTransitToken = await this.getBaseTransitToken();
        return PriceToken.createTokenFromToken(baseTransitToken);
    }

    @PCache
    private async getBaseTransitToken(): Promise<Token> {
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

    public async getTransitFeeToken(): Promise<PriceTokenAmount> {
        const [numOfContract, transitToken] = await Promise.all([
            this.getNumOfContract(),
            this.getTransitToken()
        ]);
        const feeAmount = new BigNumber(
            (await this.web3Public.callContractMethod(
                this.address,
                crossChainContractAbi,
                'feeAmountOfBlockchain',
                {
                    methodArguments: [numOfContract]
                }
            )) as string
        );
        return new PriceTokenAmount({
            ...transitToken.asStruct,
            weiAmount: feeAmount
        });
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
        const cryptoToken = await PriceToken.createTokenFromToken(
            BlockchainsInfo.getBlockchainByName(this.blockchain).nativeCoin
        );
        return new PriceTokenAmount({
            ...cryptoToken.asStruct,
            weiAmount: feeAmount
        });
    }
}
