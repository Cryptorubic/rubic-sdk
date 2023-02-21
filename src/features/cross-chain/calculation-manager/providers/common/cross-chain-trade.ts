import BigNumber from 'bignumber.js';
import {
    RubicSdkError,
    WalletNotConnectedError,
    WrongFromAddressError,
    WrongReceiverAddressError
} from 'src/common/errors';
import { nativeTokensList, PriceTokenAmount } from 'src/common/tokens';
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
import { TradeInfo } from 'src/features/cross-chain/calculation-manager/providers/common/models/trade-info';

/**
 * Abstract class for all cross-chain providers' trades.
 */
export abstract class CrossChainTrade {
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
     * Contains bridge provider's type used in route.
     */
    public abstract readonly bridgeType: BridgeType;

    /**
     * True, if provider is aggregator.
     */
    public abstract readonly isAggregator: boolean;

    protected abstract get fromContractAddress(): string;

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
        return this.web3Private.address;
    }

    protected get methodName(): string {
        // return this.from.isNative ? 'routerCallNative' : 'routerCall';
        return this.from.isNative ? 'swapEth' : 'swap';
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

    protected constructor(protected readonly providerAddress: string) {}

    /**
     * Returns true, if allowance is not enough.
     */
    public async needApprove(): Promise<boolean> {
        this.checkWalletConnected();

        if (this.from.isNative) {
            return false;
        }

        const allowance = await this.fromWeb3Public.getAllowance(
            this.from.address,
            this.walletAddress,
            this.fromContractAddress
        );
        return this.from.weiAmount.gt(allowance);
    }

    /**
     * Sends approve transaction with connected wallet.
     * @param options Transaction options.
     * @param checkNeedApprove If true, first allowance is checked.
     */
    public abstract approve(
        options: BasicTransactionOptions,
        checkNeedApprove?: boolean
    ): Promise<unknown>;

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

    /**
     * Build encoded approve transaction config.
     * @param tokenAddress Address of the smart-contract corresponding to the token.
     * @param spenderAddress Wallet or contract address to approve.
     * @param value Token amount to approve in wei.
     * @param [options] Additional options.
     * @returns Encoded approve transaction config.
     */
    public abstract encodeApprove(
        tokenAddress: string,
        spenderAddress: string,
        value: BigNumber | 'infinity',
        options: BasicTransactionOptions
    ): Promise<unknown>;

    protected async checkTradeErrors(): Promise<void | never> {
        this.checkWalletConnected();
        await Promise.all([this.checkBlockchainCorrect(), this.checkUserBalance()]);
    }

    protected checkWalletConnected(): never | void {
        if (!this.walletAddress) {
            throw new WalletNotConnectedError();
        }
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
            this.from.blockchain,
            crossChainType
        );
        if (!isAddressCorrectValue) {
            throw new WrongReceiverAddressError();
        }
    }

    /**
     * @internal
     * Gets ratio between transit usd amount and to token amount.
     */
    public abstract getTradeAmountRatio(fromUsd: BigNumber): BigNumber;

    /**
     * Calculates value for swap transaction.
     * @param providerValue Value, returned from cross-chain provider.
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

        return new BigNumber(fromValue).plus(fixedFeeValue).toFixed(0, 0);
    }

    public abstract getUsdPrice(): BigNumber;

    public abstract getTradeInfo(): TradeInfo;
}
