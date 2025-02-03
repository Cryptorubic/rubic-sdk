import { SwapRequestInterface } from '@cryptorubic/core';
import BigNumber from 'bignumber.js';
import {
    FailedToCheckForTransactionReceiptError,
    UnnecessaryApproveError
} from 'src/common/errors';
import { PriceTokenAmount } from 'src/common/tokens';
import { BLOCKCHAIN_NAME, EvmBlockchainName } from 'src/core/blockchain/models/blockchain-name';
import { BlockchainsInfo } from 'src/core/blockchain/utils/blockchains-info/blockchains-info';
import { blockchainId } from 'src/core/blockchain/utils/blockchains-info/constants/blockchain-id';
import { EvmWeb3Private } from 'src/core/blockchain/web3-private-service/web3-private/evm-web3-private/evm-web3-private';
import { EvmBasicTransactionOptions } from 'src/core/blockchain/web3-private-service/web3-private/evm-web3-private/models/evm-basic-transaction-options';
import { EvmWeb3Public } from 'src/core/blockchain/web3-public-service/web3-public/evm-web3-public/evm-web3-public';
import { EvmEncodeConfig } from 'src/core/blockchain/web3-pure/typed-web3-pure/evm-web3-pure/models/evm-encode-config';
import { Web3Pure } from 'src/core/blockchain/web3-pure/web3-pure';
import { Injector } from 'src/core/injector/injector';
import { EncodeTransactionOptions } from 'src/features/common/models/encode-transaction-options';
import { SwapTransactionOptions } from 'src/features/common/models/swap-transaction-options';
import { CrossChainTrade } from 'src/features/cross-chain/calculation-manager/providers/common/cross-chain-trade';
import { GasData } from 'src/features/cross-chain/calculation-manager/providers/common/evm-cross-chain-trade/models/gas-data';
import { TransactionReceipt } from 'web3-eth';

export abstract class EvmCrossChainTrade extends CrossChainTrade<EvmEncodeConfig> {
    public abstract readonly from: PriceTokenAmount<EvmBlockchainName>;

    /**
     * Gas fee info in source blockchain.
     */
    public abstract readonly gasData: GasData;

    protected get fromWeb3Public(): EvmWeb3Public {
        return Injector.web3PublicService.getWeb3Public(this.from.blockchain);
    }

    protected get web3Private(): EvmWeb3Private {
        return Injector.web3PrivateService.getWeb3PrivateByBlockchain(this.from.blockchain);
    }

    protected get gasLimitRatio(): number {
        if (
            this.to.blockchain === BLOCKCHAIN_NAME.ZETACHAIN ||
            this.from.blockchain === BLOCKCHAIN_NAME.ZETACHAIN
        ) {
            return 1.5;
        }
        return 1.05;
    }

    /**
     * Gets gas fee in source blockchain.
     */
    public get estimatedGas(): BigNumber | null {
        if (!this.gasData) {
            return null;
        }

        if (this.gasData.baseFee && this.gasData.maxPriorityFeePerGas) {
            return Web3Pure.fromWei(this.gasData.baseFee).plus(
                Web3Pure.fromWei(this.gasData.maxPriorityFeePerGas)
            );
        }

        if (this.gasData.gasPrice) {
            return Web3Pure.fromWei(this.gasData.gasPrice).multipliedBy(this.gasData.gasLimit ?? 0);
        }

        return null;
    }

    /**
     * Returns true, if allowance is not enough.
     */
    public override async needApprove(): Promise<boolean> {
        this.checkWalletConnected();

        if (this.from.isNative && this.from.blockchain !== BLOCKCHAIN_NAME.METIS) {
            return false;
        }

        const fromTokenAddress =
            this.from.isNative && this.from.blockchain === BLOCKCHAIN_NAME.METIS
                ? '0xdeaddeaddeaddeaddeaddeaddeaddeaddead0000'
                : this.from.address;

        const allowance = await this.fromWeb3Public.getAllowance(
            fromTokenAddress,
            this.walletAddress,
            this.contractSpender
        );
        return this.from.weiAmount.gt(allowance);
    }

    public override async approve(
        options: EvmBasicTransactionOptions,
        checkNeedApprove = true,
        amount: BigNumber | 'infinity' = 'infinity'
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
                : amount;

        const fromTokenAddress =
            this.from.isNative && this.from.blockchain === BLOCKCHAIN_NAME.METIS
                ? '0xdeaddeaddeaddeaddeaddeaddeaddeaddead0000'
                : this.from.address;

        return this.web3Private.approveTokens(
            fromTokenAddress,
            this.contractSpender,
            approveAmount,
            options
        );
    }

    /**
     *
     * @returns txHash(srcTxHash) | never
     */
    public async swap(options: SwapTransactionOptions = {}): Promise<string | never> {
        if (!options?.testMode) {
            await this.checkTradeErrors();
        }
        await this.checkReceiverAddress(
            options.receiverAddress,
            !BlockchainsInfo.isEvmBlockchainName(this.to.blockchain)
        );
        const method = options?.testMode ? 'sendTransaction' : 'trySendTransaction';

        const fromAddress = this.walletAddress;

        const { data, value, to } = await this.encode({ ...options, fromAddress });

        const { onConfirm, gasPriceOptions } = options;
        let transactionHash: string;
        const onTransactionHash = (hash: string) => {
            if (onConfirm) {
                onConfirm(hash);
            }
            transactionHash = hash;
        };

        try {
            await this.web3Private[method](to, {
                data,
                value,
                onTransactionHash,
                gasPriceOptions,
                gasLimitRatio: this.gasLimitRatio,
                ...(options?.useEip155 && {
                    chainId: `0x${blockchainId[this.from.blockchain].toString(16)}`
                })
            });

            return transactionHash!;
        } catch (err) {
            if (err instanceof FailedToCheckForTransactionReceiptError) {
                return transactionHash!;
            }
            throw err;
        }
    }

    public async encode(options: EncodeTransactionOptions): Promise<EvmEncodeConfig> {
        await this.checkFromAddress(options.fromAddress, true);
        await this.checkReceiverAddress(
            options.receiverAddress,
            !BlockchainsInfo.isEvmBlockchainName(this.to.blockchain)
        );

        return this.setTransactionConfig(
            options?.skipAmountCheck || false,
            options?.useCacheData || false,
            options.testMode || false,
            options?.receiverAddress || this.walletAddress,
            options?.refundAddress
        );
    }

    protected async getTransactionConfigAndAmount(
        testMode?: boolean,
        receiverAddress?: string
    ): Promise<{ config: EvmEncodeConfig; amount: string }> {
        const swapRequestData: SwapRequestInterface = {
            ...this.apiQuote,
            fromAddress: this.walletAddress,
            receiver: receiverAddress,
            id: this.apiResponse.id,
            enableChecks: !testMode
        };
        const swapData = await Injector.rubicApiService.fetchSwapData<EvmEncodeConfig>(
            swapRequestData
        );

        const config = {
            data: swapData.transaction.data!,
            value: swapData.transaction.value!,
            to: swapData.transaction.to!
        };

        const amount = swapData.estimate.destinationWeiAmount;

        return { config, amount };
    }
}
