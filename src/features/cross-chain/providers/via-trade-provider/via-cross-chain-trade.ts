import { BasicTransactionOptions, PriceTokenAmount, Web3Public } from 'src/core';
import { TransactionReceipt } from 'web3-eth';
import { IRoute } from '@viaprotocol/router-sdk/dist/types';
import { Via } from '@viaprotocol/router-sdk';
import { FailedToCheckForTransactionReceiptError, UnnecessaryApproveError } from 'src/common';
import { DEFAULT_API_KEY } from 'src/features/cross-chain/providers/via-trade-provider/constants/default-api-key';
import { GasData } from 'src/features/cross-chain/models/gas-data';
import { Injector } from 'src/core/sdk/injector';
import {
    BridgeType,
    CROSS_CHAIN_TRADE_TYPE,
    CrossChainTrade,
    SwapTransactionOptions
} from 'src/features';
import BigNumber from 'bignumber.js';
import { FeeInfo } from 'src/features/cross-chain/providers/common/models/fee';
import { ContractParams } from 'src/features/cross-chain/models/contract-params';
import { ItType } from 'src/features/cross-chain/models/it-type';

export class ViaCrossChainTrade extends CrossChainTrade {
    public readonly type = CROSS_CHAIN_TRADE_TYPE.VIA;

    private readonly via = new Via({
        apiKey: DEFAULT_API_KEY,
        url: 'https://router-api.via.exchange',
        timeout: 10_000
    });

    public readonly from: PriceTokenAmount;

    public readonly to: PriceTokenAmount;

    private readonly route: IRoute;

    public readonly priceImpact: number;

    public readonly toTokenAmountMin: BigNumber;

    public readonly gasData: GasData;

    public readonly feeInfo: FeeInfo;

    public readonly cryptoFeeToken: PriceTokenAmount;

    public readonly itType: ItType;

    public readonly bridgeType: BridgeType;

    protected readonly fromWeb3Public: Web3Public;

    protected get fromContractAddress(): string {
        return '';
    }

    constructor(
        crossChainTrade: {
            from: PriceTokenAmount;
            to: PriceTokenAmount;
            route: IRoute;
            gasData: GasData;
            priceImpact: number;
            toTokenAmountMin: BigNumber;
            cryptoFee: {
                amount: BigNumber;
                tokenSymbol: string;
            } | null;
            cryptoFeeToken: PriceTokenAmount;
            itType: ItType;
            bridgeType: BridgeType;
        },
        providerAddress: string
    ) {
        super(providerAddress);

        this.from = crossChainTrade.from;
        this.to = crossChainTrade.to;
        this.route = crossChainTrade.route;
        this.gasData = crossChainTrade.gasData;
        this.priceImpact = crossChainTrade.priceImpact;
        this.toTokenAmountMin = crossChainTrade.toTokenAmountMin;
        this.feeInfo = {
            fixedFee: null,
            platformFee: null,
            cryptoFee: crossChainTrade.cryptoFee
        };
        this.cryptoFeeToken = crossChainTrade.cryptoFeeToken;
        this.itType = crossChainTrade.itType;
        this.bridgeType = crossChainTrade.bridgeType;

        this.fromWeb3Public = Injector.web3PublicService.getWeb3Public(this.from.blockchain);
    }

    public async needApprove(): Promise<boolean> {
        this.checkWalletConnected();

        if (this.from.isNative) {
            return false;
        }

        const allowance = await this.via.getAllowanceStatus({
            owner: this.walletAddress,
            routeId: this.route.routeId,
            numAction: 0
        });

        return new BigNumber(allowance.value).lt(this.from.stringWeiAmount);
    }

    public async approve(options: BasicTransactionOptions): Promise<TransactionReceipt> {
        if (!(await this.needApprove())) {
            throw new UnnecessaryApproveError();
        }

        this.checkWalletConnected();
        this.checkBlockchainCorrect();

        const transaction = await this.via.buildApprovalTx({
            owner: this.walletAddress,
            routeId: this.route.routeId,
            numAction: 0
        });

        return Injector.web3Private.trySendTransaction(transaction.to, '0', {
            data: transaction.data,
            ...options
        });
    }

    protected async checkAllowanceAndApprove(
        options?: Omit<SwapTransactionOptions, 'onConfirm'>
    ): Promise<void> {
        const needApprove = await this.needApprove();
        if (!needApprove) {
            return;
        }

        const transaction = await this.via.buildApprovalTx({
            owner: this.walletAddress,
            routeId: this.route.routeId,
            numAction: 0
        });

        await Injector.web3Private.trySendTransaction(transaction.to, '0', {
            data: transaction.data,
            onTransactionHash: options?.onApprove,
            gas: options?.gasLimit || undefined,
            gasPrice: options?.gasPrice || undefined
        });
    }

    protected async checkTradeErrors(): Promise<void | never> {
        this.checkWalletConnected();
        this.checkBlockchainCorrect();

        await this.checkUserBalance();
    }

    public async swap(options: SwapTransactionOptions = {}): Promise<string | never> {
        await this.checkTradeErrors();
        await this.checkAllowanceAndApprove(options);

        const { onConfirm, gasLimit, gasPrice } = options;

        let transactionHash: string;
        const onTransactionHash = (hash: string) => {
            if (onConfirm) {
                onConfirm(hash);
            }
            transactionHash = hash;
        };

        try {
            const transaction = await this.via.buildTx({
                routeId: this.route.routeId,
                fromAddress: this.walletAddress,
                receiveAddress: this.walletAddress,
                numAction: 0
            });

            await Injector.web3Private.trySendTransaction(
                transaction.to,
                new BigNumber(transaction.value),
                {
                    data: transaction.data,
                    onTransactionHash,
                    gas: gasLimit,
                    gasPrice
                }
            );

            return transactionHash!;
        } catch (err) {
            if (err instanceof FailedToCheckForTransactionReceiptError) {
                return transactionHash!;
            }
            throw err;
        }
    }

    public async getContractParams(): Promise<ContractParams> {
        return {
            contractAddress: this.fromContractAddress,
            contractAbi: [],
            methodName: '',
            methodArguments: [],
            value: '0'
        };
    }

    public getTradeAmountRatio(): BigNumber {
        const fromCost = this.from.price.multipliedBy(this.from.tokenAmount);
        const usdCryptoFee = this.cryptoFeeToken.price.multipliedBy(
            this.cryptoFeeToken.tokenAmount
        );
        return fromCost.plus(usdCryptoFee).dividedBy(this.to.tokenAmount);
    }
}
