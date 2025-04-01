import { QuoteRequestInterface, QuoteResponseInterface } from '@cryptorubic/core';
import { UniqueProviderInfoInterface } from '@cryptorubic/core/src/lib/models/api/unique-provider-info.interface';
import BigNumber from 'bignumber.js';
import {
    RubicSdkError,
    WalletNotConnectedError,
    WrongFromAddressError,
    WrongReceiverAddressError
} from 'src/common/errors';
import { UpdatedRatesError } from 'src/common/errors/cross-chain/updated-rates-error';
import { PriceTokenAmount } from 'src/common/tokens';
import { nativeTokensList } from 'src/common/tokens/constants/native-tokens';
import { BLOCKCHAIN_NAME } from 'src/core/blockchain/models/blockchain-name';
import { BasicTransactionOptions } from 'src/core/blockchain/web3-private-service/web3-private/models/basic-transaction-options';
import { Web3Private } from 'src/core/blockchain/web3-private-service/web3-private/web3-private';
import { Web3Public } from 'src/core/blockchain/web3-public-service/web3-public/web3-public';
import { Web3Pure } from 'src/core/blockchain/web3-pure/web3-pure';
import { HttpClient } from 'src/core/http-client/models/http-client';
import { Injector } from 'src/core/injector/injector';
import { EncodeTransactionOptions } from 'src/features/common/models/encode-transaction-options';
import { SwapTransactionOptions } from 'src/features/common/models/swap-transaction-options';
import { isAddressCorrect } from 'src/features/common/utils/check-address';
import { CrossChainTradeType } from 'src/features/cross-chain/calculation-manager/models/cross-chain-trade-type';
import { BridgeType } from 'src/features/cross-chain/calculation-manager/providers/common/models/bridge-type';
import { FeeInfo } from 'src/features/cross-chain/calculation-manager/providers/common/models/fee-info';
import { OnChainSubtype } from 'src/features/cross-chain/calculation-manager/providers/common/models/on-chain-subtype';
import { RubicStep } from 'src/features/cross-chain/calculation-manager/providers/common/models/rubicStep';
import { TradeInfo } from 'src/features/cross-chain/calculation-manager/providers/common/models/trade-info';

/**
 * Abstract class for all cross-chain providers' trades.
 */
export abstract class CrossChainTrade<T = unknown> {
    protected lastTransactionConfig: T | null = null;

    protected _uniqueInfo: UniqueProviderInfoInterface = {};

    public get uniqueInfo(): UniqueProviderInfoInterface {
        return this._uniqueInfo;
    }

    /**
     * Type of calculated cross-chain trade.
     */
    public abstract readonly type: CrossChainTradeType;

    /**
     * Token to sell with input amount.
     */
    public abstract readonly from: PriceTokenAmount;

    /**
     * Token to get with output amount.
     */
    public abstract readonly to: PriceTokenAmount;

    /**
     * Minimum amount of output token user will get in Eth units.
     */
    public abstract readonly toTokenAmountMin: BigNumber;

    /**
     * Swap fee information.
     */
    public abstract readonly feeInfo: FeeInfo;

    /**
     * Contains on-chain providers' type used in route.
     */
    public abstract readonly onChainSubtype: OnChainSubtype;

    /**
     * @deprecated
     * Contains bridge provider's type used in route.
     */
    public abstract readonly bridgeType: BridgeType;

    /**
     * True, if provider is aggregator.
     */
    public abstract readonly isAggregator: boolean;

    /**
     * Promotions array.
     */
    public promotions: string[] = [];

    public readonly contractSpender: string;

    protected get httpClient(): HttpClient {
        return Injector.httpClient;
    }

    protected get fromWeb3Public(): Web3Public {
        return Injector.web3PublicService.getWeb3Public(this.from.blockchain);
    }

    protected get web3Private(): Web3Private {
        return Injector.web3PrivateService.getWeb3PrivateByBlockchain(this.from.blockchain);
    }

    protected get walletAddress(): string {
        return this._apiFromAddress ?? this.web3Private.address;
    }

    public get networkFee(): BigNumber {
        return new BigNumber(this.feeInfo.rubicProxy?.fixedFee?.amount || 0).plus(
            this.feeInfo.provider?.cryptoFee?.amount || 0
        );
    }

    public get platformFee(): BigNumber {
        return new BigNumber(this.feeInfo.rubicProxy?.platformFee?.percent || 0).plus(
            this.feeInfo.provider?.platformFee?.percent || 0
        );
    }

    protected get amountToCheck(): string {
        return this.to.stringWeiAmount;
    }

    public get needAuthWallet(): boolean {
        return false;
    }

    private _apiFromAddress: string | null = null;

    public set apiFromAddress(value: string | null) {
        this._apiFromAddress = value;
    }

    public readonly rubicId: string;

    public readonly useProxy: boolean;

    protected constructor(
        protected readonly providerAddress: string,
        protected readonly routePath: RubicStep[],
        protected readonly apiQuote: QuoteRequestInterface,
        protected readonly apiResponse: QuoteResponseInterface
    ) {
        this.useProxy = apiResponse.useRubicContract;
        this.contractSpender = apiResponse.transaction.approvalAddress!;
        this.rubicId = apiResponse.id;
    }

    /**
     * Returns true, if allowance is not enough.
     */
    public async needApprove(): Promise<boolean> {
        return false;
    }

    /**
     * Sends approve transaction with connected wallet.
     * @param options Transaction options.
     * @param checkNeedApprove If true, first allowance is checked.
     * @param amount Amount of tokens in approval window in spending cap field
     */
    public async approve(
        _options: BasicTransactionOptions,
        _checkNeedApprove?: boolean,
        _amount?: BigNumber | 'infinity'
    ): Promise<unknown> {
        return undefined;
    }

    /**
     * Sends swap transaction with connected wallet.
     * If user has not enough allowance, then approve transaction will be called first.
     *
     * @example
     * ```ts
     * const onConfirm = (hash: string) => console.log(hash);
     * const receipt = await trade.swap({ onConfirm });
     * ```
     *
     * @param options Transaction options.
     */
    public abstract swap(options?: SwapTransactionOptions): Promise<string | never>;

    /**
     * Builds transaction config, with encoded data.
     * @param options Encode transaction options.
     */
    public abstract encode(options: EncodeTransactionOptions): Promise<unknown>;

    public abstract authWallet(): Promise<string>;

    protected checkAmountChange(newWeiAmount: string, oldWeiAmount: string): void {
        const oldAmount = new BigNumber(oldWeiAmount);
        const newAmount = new BigNumber(newWeiAmount);
        const changePercent = 0.5;
        const acceptablePercentPriceChange = new BigNumber(changePercent).dividedBy(100);

        const amountPlusPercent = oldAmount.multipliedBy(acceptablePercentPriceChange.plus(1));
        const amountMinusPercent = oldAmount.multipliedBy(
            new BigNumber(1).minus(acceptablePercentPriceChange)
        );

        const shouldThrowError =
            newAmount.lt(amountMinusPercent) || newAmount.gt(amountPlusPercent);

        if (shouldThrowError) {
            throw new UpdatedRatesError(oldWeiAmount, newWeiAmount);
        }
    }

    protected async checkTradeErrors(): Promise<void | never> {
        this.checkWalletConnected();
        await Promise.all([
            this.checkBlockchainCorrect(),
            this.checkUserBalance(),
            this.checkBlockchainRequirements()
        ]);
    }

    protected checkWalletConnected(): never | void {
        if (!this.walletAddress) {
            throw new WalletNotConnectedError();
        }
    }

    public async checkBlockchainRequirements(): Promise<boolean> {
        if (this.to.blockchain === BLOCKCHAIN_NAME.SEI && !this.to.isNative && this.walletAddress) {
            const web3 = Injector.web3PublicService.getWeb3Public(BLOCKCHAIN_NAME.SEI);
            const transactionCount = await web3.getTransactionCount(this.walletAddress);
            const balance = await web3.getBalance(this.walletAddress, this.to.address);
            if (new BigNumber(balance).eq(0) && transactionCount === 0) {
                return true;
            }
        }
        return false;
    }

    protected async checkBlockchainCorrect(): Promise<void | never> {
        await this.web3Private.checkBlockchainCorrect(this.from.blockchain);
    }

    protected async checkUserBalance(): Promise<void | never> {
        await this.fromWeb3Public.checkBalance(
            this.from,
            this.from.tokenAmount,
            this.walletAddress
        );
    }

    protected async checkFromAddress(
        fromAddress: string | undefined,
        isRequired = false,
        crossChainType?: CrossChainTradeType
    ): Promise<void | never> {
        if (!fromAddress) {
            if (isRequired) {
                throw new RubicSdkError(`'fromAddress' is required option`);
            }
            return;
        }
        const isAddressCorrectValue = await isAddressCorrect(
            fromAddress,
            this.from.blockchain,
            crossChainType
        );
        if (!isAddressCorrectValue) {
            throw new WrongFromAddressError();
        }
    }

    protected async checkReceiverAddress(
        receiverAddress: string | undefined,
        isRequired = false,
        crossChainType?: CrossChainTradeType
    ): Promise<void | never> {
        if (!receiverAddress) {
            if (isRequired) {
                throw new RubicSdkError(`'receiverAddress' is required option`);
            }
            return;
        }
        const isAddressCorrectValue = await isAddressCorrect(
            receiverAddress,
            this.to.blockchain,
            crossChainType
        );
        if (!isAddressCorrectValue) {
            throw new WrongReceiverAddressError();
        }
    }

    /**
     * Calculates value for swap transaction.
     * @param providerValue Value, returned from cross-chain provider. Not '0' if from is native or provider has extranative
     */
    protected getSwapValue(providerValue?: BigNumber | string | number | null): string {
        const nativeToken = nativeTokensList[this.from.blockchain];
        const fixedFeeValue = Web3Pure.toWei(
            this.feeInfo.rubicProxy?.fixedFee?.amount || 0,
            nativeToken.decimals
        );

        let fromValue: BigNumber;
        if (this.from.isNative) {
            if (providerValue) {
                fromValue = new BigNumber(providerValue).dividedBy(
                    1 - (this.feeInfo.rubicProxy?.platformFee?.percent || 0) / 100
                );
            } else {
                fromValue = this.from.weiAmount;
            }
        } else {
            fromValue = new BigNumber(providerValue || 0);
        }
        // 100 / 0.98
        return new BigNumber(fromValue).plus(fixedFeeValue).toFixed(0, 0);
    }

    public getUsdPrice(providerFeeToken?: BigNumber): BigNumber {
        let feeSum = new BigNumber(0);
        const providerFee = this.feeInfo.provider?.cryptoFee;
        if (providerFee) {
            feeSum = feeSum.plus(
                providerFee.amount.multipliedBy(providerFeeToken || providerFee.token.price)
            );
        }

        return this.to.price.multipliedBy(this.to.tokenAmount).minus(feeSum);
    }

    public abstract getTradeInfo(): TradeInfo;

    protected abstract getTransactionConfigAndAmount(
        testMode?: boolean,
        receiverAddress?: string,
        refundAddress?: string
    ): Promise<{ config: T; amount: string }>;

    protected async setTransactionConfig(
        skipAmountChangeCheck: boolean,
        useCacheData: boolean,
        testMode?: boolean,
        receiverAddress?: string,
        refundAddress?: string
    ): Promise<T> {
        if (this.lastTransactionConfig && useCacheData) {
            return this.lastTransactionConfig;
        }

        const { config, amount } = await this.getTransactionConfigAndAmount(
            testMode,
            receiverAddress,
            refundAddress
        );
        this.lastTransactionConfig = config;
        setTimeout(() => {
            this.lastTransactionConfig = null;
        }, 15_000);

        if (!skipAmountChangeCheck) {
            this.checkAmountChange(amount, this.amountToCheck);
        }
        return config;
    }
}
