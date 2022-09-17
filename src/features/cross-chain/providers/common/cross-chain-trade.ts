import { BlockchainName } from 'src/core/blockchain/models/blockchain-name';
import { FeeInfo } from 'src/features/cross-chain/providers/common/models/fee';
import { BlockchainsInfo } from 'src/core/blockchain/utils/blockchains-info/blockchains-info';
import { Injector } from 'src/core/injector/injector';
import { Web3Pure } from 'src/core/blockchain/web3-pure/web3-pure';
import {
    InsufficientFundsError,
    WalletNotConnectedError,
    WrongNetworkError,
    WrongReceiverAddressError
} from 'src/common/errors';
import { CrossChainTradeType } from 'src/features/cross-chain/models/cross-chain-trade-type';
import { PriceTokenAmount } from 'src/common/tokens';
import BigNumber from 'bignumber.js';
import { Web3Private } from 'src/core/blockchain/web3-private-service/web3-private/web3-private';
import { Web3Public } from 'src/core/blockchain/web3-public-service/web3-public/web3-public';
import { HttpClient } from 'src/core/http-client/models/http-client';
import { BasicSwapTransactionOptions } from 'src/features/cross-chain/providers/common/models/basic-swap-transaction-options';
import { BasicEncodeTransactionOptions } from 'src/features/cross-chain/providers/common/models/basic-encode-transaction-options';
import { BasicTransactionOptions } from 'src/core/blockchain/web3-private-service/web3-private/models/basic-transaction-options';
import { ItType } from 'src/features/cross-chain/providers/common/models/it-type';

/**
 * Abstract class for all cross chain providers' trades.
 */
export abstract class CrossChainTrade {
    /**
     * Checks receiver address for correctness.
     * @param receiverAddress Receiver address.
     * @param toBlockchain Target blockchain.
     */
    public static checkReceiverAddress(
        receiverAddress: string | undefined,
        toBlockchain: BlockchainName
    ): void {
        if (!receiverAddress) {
            return;
        }

        const toChainType = BlockchainsInfo.getChainType(toBlockchain);
        if (Web3Pure[toChainType].isAddressCorrect(receiverAddress)) {
            return;
        }
        throw new WrongReceiverAddressError();
    }

    /**
     * Type of calculated cross chain trade.
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

    public abstract readonly itType: ItType;

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
        return this.from.isNative ? 'routerCallNative' : 'routerCall';
    }

    public get networkFee(): BigNumber {
        return new BigNumber(this.feeInfo.fixedFee?.amount || 0).plus(
            this.feeInfo.cryptoFee?.amount || 0
        );
    }

    protected constructor(protected readonly providerAddress: string) {}

    /**
     * Returns true, if allowance is not enough.
     */
    public abstract needApprove(): Promise<boolean>;

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
    public abstract swap(options?: BasicSwapTransactionOptions): Promise<string | never>;

    /**
     * Builds transaction config, with encoded data.
     * @param options Encode transaction options.
     */
    public abstract encode(options: BasicEncodeTransactionOptions): Promise<unknown>;

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
        const userBlockchainName = await this.web3Private.getBlockchainName();
        if (userBlockchainName !== this.from.blockchain) {
            throw new WrongNetworkError();
        }
    }

    protected async checkUserBalance(): Promise<void | never> {
        const balance = await this.fromWeb3Public.getBalance(this.walletAddress, this.from.address);
        if (balance.lt(this.from.weiAmount)) {
            throw new InsufficientFundsError(
                this.from,
                Web3Pure.fromWei(balance, this.from.decimals),
                this.from.tokenAmount
            );
        }
    }

    /**
     * @internal
     * Gets ratio between transit usd amount and to token amount.
     */
    public abstract getTradeAmountRatio(fromUsd: BigNumber): BigNumber;
}
