/**
 * Abstract class for all cross chain providers' trades.
 */ import { EvmWeb3Private } from 'src/core/blockchain/web3-private-service/web3-private/evm-web3-private';
import {
    BLOCKCHAIN_NAME,
    BlockchainName,
    EvmBlockchainName
} from 'src/core/blockchain/models/blockchain-name';
import { FeeInfo } from 'src/features/cross-chain/providers/common/models/fee';
import { BlockchainsInfo } from 'src/core/blockchain/utils/blockchains-info';
import { GasData } from 'src/features/cross-chain/models/gas-data';
import { Injector } from 'src/core/injector/injector';
import { Network, validate } from 'bitcoin-address-validation';
import { Web3Pure } from 'src/core/blockchain/web3-pure/web3-pure';
import { EncodeTransactionOptions } from 'src/features/instant-trades/models/encode-transaction-options';
import { CHAIN_TYPE } from 'src/core/blockchain/models/chain-type';
import { UnnecessaryApproveError, WalletNotConnectedError } from 'src/common/errors';
import { BasicTransactionOptions } from 'src/core/blockchain/models/basic-transaction-options';
import { TransactionReceipt } from 'web3-eth';
import { TransactionConfig } from 'web3-core';
import { CrossChainTradeType } from 'src/features/cross-chain/models/cross-chain-trade-type';
import { PriceTokenAmount } from 'src/common/tokens';
import { ContractParams } from 'src/features/cross-chain/models/contract-params';
import { TransactionOptions } from 'src/core/blockchain/models/transaction-options';
import { WrongReceiverAddressError } from 'src/common/errors/blockchain/wrong-receiver-address.error';
import { ItType } from 'src/features/cross-chain/models/it-type';
import { SwapTransactionOptions } from 'src/features/instant-trades/models/swap-transaction-options';
import { EvmWeb3Public } from 'src/core/blockchain/web3-public-service/web3-public/evm-web3-public';
import { EvmWeb3Pure } from 'src/core/blockchain/web3-pure/typed-web3-pure/evm-web3-pure';
import BigNumber from 'bignumber.js';

export abstract class CrossChainTrade {
    /**
     * Checks receiver address for correctness.
     * @param receiverAddress Receiver address.
     * @param toBlockchain Target blockchain.
     */
    public static checkReceiverAddress(
        receiverAddress: string | undefined,
        toBlockchain?: BlockchainName
    ): void {
        if (!receiverAddress) {
            return;
        }
        if (toBlockchain === BLOCKCHAIN_NAME.BITCOIN) {
            const isAddressValid = validate(receiverAddress, Network.mainnet);
            if (isAddressValid) {
                return;
            }
            throw new WrongReceiverAddressError();
        }
        if (
            Web3Pure[
                toBlockchain ? BlockchainsInfo.getChainType(toBlockchain) : CHAIN_TYPE.EVM
            ].isAddressCorrect(receiverAddress)
        ) {
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
    public abstract readonly from: PriceTokenAmount<EvmBlockchainName>;

    /**
     * Token to get with output amount.
     */
    public abstract readonly to: PriceTokenAmount;

    /**
     * Minimum amount of output token user will get.
     */
    public abstract readonly toTokenAmountMin: BigNumber;

    /**
     * Gas fee info in source blockchain.
     */
    public abstract readonly gasData: GasData;

    protected abstract readonly fromWeb3Public: EvmWeb3Public;

    protected abstract get fromContractAddress(): string;

    public abstract readonly itType: ItType;

    /**
     * Swap fee information.
     */
    public abstract readonly feeInfo: FeeInfo;

    protected get web3Private(): EvmWeb3Private {
        return Injector.web3PrivateService.getWeb3PrivateByBlockchain(this.from.blockchain);
    }

    protected get walletAddress(): string {
        return this.web3Private.address;
    }

    protected get networkFee(): BigNumber {
        return new BigNumber(this.feeInfo.fixedFee?.amount || 0).plus(
            this.feeInfo.cryptoFee?.amount || 0
        );
    }

    protected get methodName(): string {
        return this.from.isNative ? 'routerCallNative' : 'routerCall';
    }

    /**
     * Gets gas fee in source blockchain.
     */
    public get estimatedGas(): BigNumber | null {
        if (!this.gasData) {
            return null;
        }
        return Web3Pure.fromWei(this.gasData.gasPrice).multipliedBy(this.gasData.gasLimit);
    }

    protected constructor(protected readonly providerAddress: string) {}

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

    public abstract getContractParams(options: {
        fromAddress?: string;
        receiverAddress?: string;
    }): Promise<ContractParams>;

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
    public async approve(
        options: BasicTransactionOptions,
        checkNeedApprove = true
    ): Promise<TransactionReceipt> {
        if (checkNeedApprove) {
            const needApprove = await this.needApprove();
            if (!needApprove) {
                throw new UnnecessaryApproveError();
            }
        }

        this.checkWalletConnected();
        await this.checkBlockchainCorrect();

        const approveAmount =
            this.from.blockchain === BLOCKCHAIN_NAME.GNOSIS ||
            this.from.blockchain === BLOCKCHAIN_NAME.CRONOS
                ? this.from.weiAmount
                : 'infinity';

        return this.web3Private.approveTokens(
            this.from.address,
            this.fromContractAddress,
            approveAmount,
            options
        );
    }

    /**
     * Build encoded approve transaction config.
     * @param tokenAddress Address of the smart-contract corresponding to the token.
     * @param spenderAddress Wallet or contract address to approve.
     * @param value Token amount to approve in wei.
     * @param [options] Additional options.
     * @returns Encoded approve transaction config.
     */
    public async encodeApprove(
        tokenAddress: string,
        spenderAddress: string,
        value: BigNumber | 'infinity',
        options: TransactionOptions = {}
    ): Promise<TransactionConfig> {
        return this.web3Private.encodeApprove(tokenAddress, spenderAddress, value, options);
    }

    protected async checkAllowanceAndApprove(
        options?: Omit<SwapTransactionOptions, 'onConfirm'>
    ): Promise<void> {
        const needApprove = await this.needApprove();
        if (!needApprove) {
            return;
        }

        const approveOptions: BasicTransactionOptions = {
            onTransactionHash: options?.onApprove,
            gas: options?.approveGasLimit,
            gasPrice: options?.gasPrice
        };

        await this.approve(approveOptions, false);
    }

    /**
     * Builds transaction config, with encoded data.
     * @param options Encode transaction options.
     */
    public async encode(options: EncodeTransactionOptions): Promise<TransactionConfig> {
        const { gasLimit, gasPrice } = options;

        const { contractAddress, contractAbi, methodName, methodArguments, value } =
            await this.getContractParams({ fromAddress: options?.fromAddress });

        return EvmWeb3Pure.encodeMethodCall(
            contractAddress,
            contractAbi,
            methodName,
            methodArguments,
            value,
            {
                gas: gasLimit || this.gasData?.gasLimit.toFixed(0),
                gasPrice: gasPrice || this.gasData?.gasPrice.toFixed()
            }
        );
    }

    protected checkWalletConnected(): never | void {
        if (!this.walletAddress) {
            throw new WalletNotConnectedError();
        }
    }

    protected async checkBlockchainCorrect(): Promise<void | never> {
        await this.web3Private.checkBlockchainCorrect(this.from.blockchain);
    }

    protected checkUserBalance(): Promise<void | never> {
        return this.fromWeb3Public.checkBalance(
            this.from,
            this.from.tokenAmount,
            this.walletAddress
        );
    }

    protected async checkTradeErrors(): Promise<void | never> {
        this.checkWalletConnected();
        await this.checkBlockchainCorrect();

        await this.checkUserBalance();
    }

    /**
     * @internal
     * Gets ratio between transit usd amount and to token amount.
     */
    public abstract getTradeAmountRatio(fromUsd: BigNumber): BigNumber;
}
