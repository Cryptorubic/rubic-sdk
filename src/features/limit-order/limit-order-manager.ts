import {
    limirOrderProtocolAdresses,
    LimitOrderBuilder,
    LimitOrderPredicateCallData,
    LimitOrderProtocolFacade,
    NonceSeriesV2,
    seriesNonceManagerContractAddresses,
    SeriesNonceManagerFacade,
    SeriesNonceManagerPredicateBuilder,
    Web3ProviderConnector
} from '@1inch/limit-order-protocol-utils';
import { LimitOrderPredicateBuilder } from '@1inch/limit-order-protocol-utils/limit-order-predicate.builder';
import { ChainId } from '@1inch/limit-order-protocol-utils/model/limit-order-protocol.model';
import BigNumber from 'bignumber.js';
import { RubicSdkError, UnnecessaryApproveError, WalletNotConnectedError } from 'src/common/errors';
import { Token, TokenAmount } from 'src/common/tokens';
import { TokenBaseStruct } from 'src/common/tokens/models/token-base-struct';
import {
    BLOCKCHAIN_NAME,
    BlockchainName,
    EvmBlockchainName
} from 'src/core/blockchain/models/blockchain-name';
import { CHAIN_TYPE } from 'src/core/blockchain/models/chain-type';
import { BlockchainsInfo } from 'src/core/blockchain/utils/blockchains-info/blockchains-info';
import { blockchainId } from 'src/core/blockchain/utils/blockchains-info/constants/blockchain-id';
import { EvmWeb3Private } from 'src/core/blockchain/web3-private-service/web3-private/evm-web3-private/evm-web3-private';
import { EvmBasicTransactionOptions } from 'src/core/blockchain/web3-private-service/web3-private/evm-web3-private/models/evm-basic-transaction-options';
import { TronTransactionOptions } from 'src/core/blockchain/web3-private-service/web3-private/tron-web3-private/models/tron-transaction-options';
import { EvmWeb3Public } from 'src/core/blockchain/web3-public-service/web3-public/evm-web3-public/evm-web3-public';
import { Injector } from 'src/core/injector/injector';
import { SwapTransactionOptions } from 'src/features/common/models/swap-transaction-options';
import { LimitOrdersApiService } from 'src/features/limit-order/limit-order-api-service';
import { LimitOrder } from 'src/features/limit-order/models/limit-order';
import {
    LimitOrderSupportedBlockchain,
    limitOrderSupportedBlockchains
} from 'src/features/limit-order/models/supported-blockchains';
import { TransactionReceipt } from 'web3-eth';

export class LimitOrderManager {
    public static isSupportedBlockchain(
        blockchain: BlockchainName
    ): blockchain is LimitOrderSupportedBlockchain {
        return limitOrderSupportedBlockchains.some(
            supportedBlockchain => supportedBlockchain === blockchain
        );
    }

    private readonly apiService = new LimitOrdersApiService();

    private getWeb3Public(blockchain: EvmBlockchainName): EvmWeb3Public {
        return Injector.web3PublicService.getWeb3Public(blockchain);
    }

    private getWeb3Private(blockchain: EvmBlockchainName): EvmWeb3Private {
        const chainType = BlockchainsInfo.getChainType(blockchain);
        return Injector.web3PrivateService.getWeb3Private(chainType);
    }

    private checkWalletConnected(blockchain: EvmBlockchainName): never | void {
        if (!this.getWeb3Private(blockchain).address) {
            throw new WalletNotConnectedError();
        }
    }

    public async needApprove(
        fromToken: Token<EvmBlockchainName> | TokenBaseStruct<EvmBlockchainName>,
        fromAmount: BigNumber | string | number
    ): Promise<boolean> {
        const { blockchain } = fromToken;
        this.checkWalletConnected(blockchain);

        const fromTokenAmount = await TokenAmount.createToken({
            ...fromToken,
            tokenAmount: new BigNumber(fromAmount)
        });
        const walletAddress = this.getWeb3Private(blockchain).address;
        const chainId = blockchainId[blockchain] as ChainId;
        const contractAddress = limirOrderProtocolAdresses[chainId];
        const allowance = await this.getWeb3Public(blockchain).getAllowance(
            fromToken.address,
            walletAddress,
            contractAddress
        );
        return fromTokenAmount.weiAmount.gt(allowance);
    }

    public async approve(
        fromToken: Token<EvmBlockchainName> | TokenBaseStruct<EvmBlockchainName>,
        fromAmount: BigNumber | string | number,
        options: EvmBasicTransactionOptions,
        checkNeedApprove = true
    ): Promise<TransactionReceipt> {
        if (checkNeedApprove) {
            const needApprove = await this.needApprove(fromToken, fromAmount);
            if (!needApprove) {
                throw new UnnecessaryApproveError();
            }
        }

        const { blockchain } = fromToken;
        this.checkWalletConnected(blockchain);
        await this.getWeb3Private(blockchain).checkBlockchainCorrect(blockchain);

        const fromTokenAmount = await TokenAmount.createToken({
            ...fromToken,
            tokenAmount: new BigNumber(fromAmount)
        });

        const approveAmount =
            fromToken.blockchain === BLOCKCHAIN_NAME.GNOSIS ||
            fromToken.blockchain === BLOCKCHAIN_NAME.CRONOS
                ? fromTokenAmount.weiAmount
                : 'infinity';

        const chainId = blockchainId[blockchain] as ChainId;
        const contractAddress = limirOrderProtocolAdresses[chainId];
        return this.getWeb3Private(blockchain).approveTokens(
            fromTokenAmount.address,
            contractAddress,
            approveAmount,
            options
        );
    }

    private async checkAllowanceAndApprove(
        fromTokenAmount: TokenAmount<EvmBlockchainName>,
        options?: Omit<SwapTransactionOptions, 'onConfirm' | 'feeLimit'>
    ): Promise<void> {
        const needApprove = await this.needApprove(fromTokenAmount, fromTokenAmount.tokenAmount);
        if (!needApprove) {
            return;
        }

        const approveOptions: TronTransactionOptions = {
            onTransactionHash: options?.onApprove,
            feeLimit: options?.approveFeeLimit
        };
        await this.approve(fromTokenAmount, fromTokenAmount.tokenAmount, approveOptions, false);
    }

    public async createOrder(
        fromToken: Token<EvmBlockchainName> | TokenBaseStruct<EvmBlockchainName>,
        toToken: string | Token<EvmBlockchainName> | TokenBaseStruct<EvmBlockchainName>,
        fromAmount: BigNumber | string | number,
        toAmount: BigNumber | string | number
    ): Promise<void> {
        const fromTokenAmount = await TokenAmount.createToken({
            ...fromToken,
            tokenAmount: new BigNumber(fromAmount)
        });
        const toTokenParsed =
            typeof toToken === 'string'
                ? { address: toToken, blockchain: fromToken.blockchain }
                : toToken;
        const toTokenAmount = await TokenAmount.createToken({
            ...toTokenParsed,
            tokenAmount: new BigNumber(toAmount)
        });
        if (fromTokenAmount.blockchain !== toTokenAmount.blockchain) {
            throw new RubicSdkError('Blockchains must be equal');
        }
        const blockchain = fromTokenAmount.blockchain;

        await this.checkAllowanceAndApprove(fromTokenAmount);

        const chainId = blockchainId[blockchain] as ChainId;
        const chainType = BlockchainsInfo.getChainType(blockchain) as CHAIN_TYPE.EVM;
        const walletAddress = Injector.web3PrivateService.getWeb3Private(chainType).address;

        const connector = new Web3ProviderConnector(
            Injector.web3PrivateService.getWeb3Private(chainType).web3
        );
        const contractAddress = limirOrderProtocolAdresses[chainId];
        const seriesContractAddress = seriesNonceManagerContractAddresses[chainId];

        const limitOrderProtocolFacade = new LimitOrderProtocolFacade(
            contractAddress,
            chainId,
            connector
        );
        const limitOrderPredicateBuilder = new LimitOrderPredicateBuilder(limitOrderProtocolFacade);
        const seriesNonceManagerFacade = new SeriesNonceManagerFacade(
            seriesContractAddress,
            chainId,
            connector
        );
        const seriesNonceManagerPredicateBuilder = new SeriesNonceManagerPredicateBuilder(
            seriesNonceManagerFacade
        );

        const expiration = Math.floor(Date.now() / 1000) + 20 * 10 ** 9;
        const nonce = await seriesNonceManagerFacade.getNonce(
            NonceSeriesV2.LimitOrderV3,
            walletAddress
        );
        const simpleLimitOrderPredicate: LimitOrderPredicateCallData =
            limitOrderPredicateBuilder.arbitraryStaticCall(
                seriesNonceManagerPredicateBuilder.facade,
                seriesNonceManagerPredicateBuilder.timestampBelowAndNonceEquals(
                    NonceSeriesV2.LimitOrderV3,
                    expiration,
                    BigInt(nonce),
                    walletAddress
                )
            );

        const limitOrderBuilder = new LimitOrderBuilder(contractAddress, chainId, connector);
        const limitOrder = limitOrderBuilder.buildLimitOrder({
            makerAssetAddress: fromTokenAmount.address,
            takerAssetAddress: toTokenAmount.address,
            makerAddress: walletAddress,
            makingAmount: fromTokenAmount.stringWeiAmount,
            takingAmount: toTokenAmount.stringWeiAmount,
            predicate: simpleLimitOrderPredicate
        });

        const limitOrderTypedData = limitOrderBuilder.buildLimitOrderTypedData(limitOrder);
        const limitOrderSignature = await limitOrderBuilder.buildOrderSignature(
            walletAddress,
            limitOrderTypedData
        );
        const limitOrderHash = limitOrderBuilder.buildLimitOrderHash(limitOrderTypedData);

        await Injector.httpClient.post(
            `https://limit-orders.1inch.io/v3.0/${chainId}/limit-order`,
            {
                orderHash: limitOrderHash,
                signature: limitOrderSignature,
                data: limitOrder
            }
        );
    }

    public getUserTrades(userAddress: string): Promise<LimitOrder[]> {
        return this.apiService.getUserOrders(userAddress);
    }
}
