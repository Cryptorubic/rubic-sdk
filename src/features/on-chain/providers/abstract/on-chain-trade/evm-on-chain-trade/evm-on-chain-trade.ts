import { OnChainTrade } from 'src/features/on-chain/providers/abstract/on-chain-trade/on-chain-trade';
import { PriceTokenAmount } from 'src/common/tokens';
import { BLOCKCHAIN_NAME, EvmBlockchainName } from 'src/core/blockchain/models/blockchain-name';
import { GasFeeInfo } from 'src/features/on-chain/providers/abstract/on-chain-trade/evm-on-chain-trade/models/gas-fee-info';
import { Injector } from 'src/core/injector/injector';
import { EvmWeb3Private } from 'src/core/blockchain/web3-private-service/web3-private/evm-web3-private/evm-web3-private';
import { EvmWeb3Public } from 'src/core/blockchain/web3-public-service/web3-public/evm-web3-public/evm-web3-public';
import { TransactionReceipt } from 'web3-eth';
import { UnnecessaryApproveError } from 'src/common/errors';
import { EvmBasicTransactionOptions } from 'src/core/blockchain/web3-private-service/web3-private/evm-web3-private/models/evm-basic-transaction-options';
import BigNumber from 'bignumber.js';
import { EvmTransactionOptions } from 'src/core/blockchain/web3-private-service/web3-private/evm-web3-private/models/evm-transaction-options';
import { TransactionConfig } from 'web3-core';
import {
    OptionsGasParams,
    TransactionGasParams
} from 'src/features/on-chain/providers/abstract/on-chain-trade/evm-on-chain-trade/models/gas-params';
import { EvmSwapTransactionOptions } from 'src/features/common/models/evm/evm-swap-transaction-options';
import { EvmEncodeTransactionOptions } from 'src/features/common/models/evm/evm-encode-transaction-options';

export abstract class EvmOnChainTrade extends OnChainTrade {
    public abstract readonly from: PriceTokenAmount<EvmBlockchainName>;

    public abstract readonly to: PriceTokenAmount<EvmBlockchainName>;

    /**
     * Gas fee info, including gas limit and gas price.
     */
    public abstract gasFeeInfo: GasFeeInfo | null;

    protected get web3Public(): EvmWeb3Public {
        return Injector.web3PublicService.getWeb3Public(this.from.blockchain);
    }

    protected get web3Private(): EvmWeb3Private {
        return Injector.web3PrivateService.getWeb3PrivateByBlockchain(this.from.blockchain);
    }

    public async approve(
        options: EvmBasicTransactionOptions,
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
            this.contractAddress,
            approveAmount,
            options
        );
    }

    protected async checkAllowanceAndApprove(
        options?: Omit<EvmSwapTransactionOptions, 'onConfirm' | 'gasLimit'>
    ): Promise<void> {
        const needApprove = await this.needApprove();
        if (!needApprove) {
            return;
        }

        const approveOptions: EvmBasicTransactionOptions = {
            onTransactionHash: options?.onApprove,
            gas: options?.approveGasLimit || undefined,
            gasPrice: options?.gasPrice || undefined
        };

        await this.approve(approveOptions, false);
    }

    public abstract swap(options?: EvmSwapTransactionOptions): Promise<string | never>;

    public abstract encode(options: EvmEncodeTransactionOptions): Promise<TransactionConfig>;

    public async encodeApprove(
        tokenAddress: string,
        spenderAddress: string,
        value: BigNumber | 'infinity',
        options: EvmTransactionOptions = {}
    ): Promise<TransactionConfig> {
        return this.web3Private.encodeApprove(tokenAddress, spenderAddress, value, options);
    }

    protected getGasParams(options: OptionsGasParams): TransactionGasParams {
        return {
            gas: options.gasLimit || this.gasFeeInfo?.gasLimit?.toFixed(),
            gasPrice: options.gasPrice || this.gasFeeInfo?.gasPrice?.toFixed()
        };
    }
}
