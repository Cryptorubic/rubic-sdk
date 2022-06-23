import { CROSS_CHAIN_TRADE_TYPE, SwapTransactionOptions } from 'src/features';
import { CrossChainTrade } from '@features/cross-chain/providers/common/cross-chain-trade';
import { BasicTransactionOptions, PriceTokenAmount, Web3Public } from 'src/core';
import { Injector } from '@core/sdk/injector';
import { SYMBIOSIS_CONTRACT_ADDRESS } from '@features/cross-chain/providers/symbiosis-trade-provider/constants/contract-address';
import { SymbiosisCrossChainSupportedBlockchain } from '@features/cross-chain/providers/symbiosis-trade-provider/constants/symbiosis-cross-chain-supported-blockchain';
import { FailedToCheckForTransactionReceiptError, UnnecessaryApproveError } from 'src/common';
import { GasData } from '@features/cross-chain/models/gas-data';
import BigNumber from 'bignumber.js';
import { DEFAULT_API_KEY } from '@features/cross-chain/providers/via-trade-provider/constants/default-api-key';
import { IRoute } from '@viaprotocol/router-sdk/src/types';
import { TransactionReceipt } from 'web3-eth';
import Via from '@viaprotocol/router-sdk/src';

/**
 * Calculated Symbiosis cross chain trade.
 */
export class ViaCrossChainTrade extends CrossChainTrade {
    public readonly type = CROSS_CHAIN_TRADE_TYPE.VIA;

    private readonly via = new Via({
        apiKey: DEFAULT_API_KEY,
        url: 'https://router-api.via.exchange',
        timeout: 30
    });

    public readonly from: PriceTokenAmount;

    public readonly to: PriceTokenAmount;

    private readonly route: IRoute;

    /**
     * Overall price impact, fetched from symbiosis api.
     */
    public readonly priceImpact: number;

    public readonly gasData: GasData | null;

    protected readonly fromWeb3Public: Web3Public;

    private get fromBlockchain(): SymbiosisCrossChainSupportedBlockchain {
        return this.from.blockchain as SymbiosisCrossChainSupportedBlockchain;
    }

    protected get fromContractAddress(): string {
        return SYMBIOSIS_CONTRACT_ADDRESS[this.fromBlockchain];
    }

    constructor(
        crossChainTrade: {
            from: PriceTokenAmount;
            to: PriceTokenAmount;
            route: IRoute;
            gasData: GasData | null;
            priceImpact: number;
        },
        providerAddress: string
    ) {
        super(providerAddress);

        this.from = crossChainTrade.from;
        this.to = crossChainTrade.to;
        this.route = crossChainTrade.route;
        this.gasData = crossChainTrade.gasData;
        this.priceImpact = crossChainTrade.priceImpact;

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

        return Injector.web3Private.trySendTransaction(transaction.to, {
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

        await Injector.web3Private.trySendTransaction(transaction.to, {
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

            await Injector.web3Private.trySendTransaction(transaction.to, {
                value: new BigNumber(transaction.value),
                data: transaction.data,
                onTransactionHash,
                gas: gasLimit,
                gasPrice
            });

            return transactionHash!;
        } catch (err) {
            if (err instanceof FailedToCheckForTransactionReceiptError) {
                return transactionHash!;
            }
            throw err;
        }
    }
}
