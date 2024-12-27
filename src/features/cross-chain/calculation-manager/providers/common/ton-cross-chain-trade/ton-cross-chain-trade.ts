import { TronTransactionConfig } from '@cryptorubic/web3';
import BigNumber from 'bignumber.js';
import { RubicSdkError } from 'src/common/errors';
import { PriceTokenAmount } from 'src/common/tokens';
import { BLOCKCHAIN_NAME, TonBlockchainName } from 'src/core/blockchain/models/blockchain-name';
import { TonEncodedConfig } from 'src/core/blockchain/web3-private-service/web3-private/ton-web3-private/models/ton-types';
import { TonWeb3Private } from 'src/core/blockchain/web3-private-service/web3-private/ton-web3-private/ton-web3-private';
import { TonWeb3Public } from 'src/core/blockchain/web3-public-service/web3-public/ton-web3-public/ton-web3-public';
import { Injector } from 'src/core/injector/injector';
import { EncodeTransactionOptions } from 'src/features/common/models/encode-transaction-options';
import { SwapTransactionOptions } from 'src/features/common/models/swap-transaction-options';
import { CrossChainTrade } from 'src/features/cross-chain/calculation-manager/providers/common/cross-chain-trade';

export abstract class TonCrossChainTrade extends CrossChainTrade<TonEncodedConfig> {
    public abstract readonly from: PriceTokenAmount<TonBlockchainName>;

    /**
     * Gas fee info in source blockchain.
     */
    protected get fromWeb3Public(): TonWeb3Public {
        return Injector.web3PublicService.getWeb3Public(BLOCKCHAIN_NAME.TON);
    }

    protected get web3Private(): TonWeb3Private {
        return Injector.web3PrivateService.getWeb3PrivateByBlockchain(BLOCKCHAIN_NAME.TON);
    }

    public async encode(_options: EncodeTransactionOptions): Promise<TronTransactionConfig> {
        throw new RubicSdkError(
            'Method not implemented! Use custom swap methods on each child class!'
        );
    }

    public async swap(_options: SwapTransactionOptions = {}): Promise<string | never> {
        // @TODO API
        throw new Error('Not implemented');
        // if (!options?.testMode) {
        //     await this.checkTradeErrors();
        // }
        // await this.checkReceiverAddress(
        //     options.receiverAddress,
        //     !BlockchainsInfo.isEvmBlockchainName(this.to.blockchain)
        // );
        // const fromAddress = this.walletAddress;
        //
        // const { data, value, to } = await this.encode({ ...options, fromAddress });
        //
        // const { onConfirm, gasPriceOptions } = options;
        // let transactionHash: string;
        // const onTransactionHash = (hash: string) => {
        //     if (onConfirm) {
        //         onConfirm(hash);
        //     }
        //     transactionHash = hash;
        // };
        //
        // try {
        //     await this.web3Private[method](to, {
        //         data,
        //         value,
        //         onTransactionHash,
        //         gasPriceOptions,
        //         gasLimitRatio: this.gasLimitRatio,
        //         ...(options?.useEip155 && {
        //             chainId: `0x${blockchainId[this.from.blockchain].toString(16)}`
        //         })
        //     });
        //
        //     return transactionHash!;
        // } catch (err) {
        //     if (err instanceof FailedToCheckForTransactionReceiptError) {
        //         return transactionHash!;
        //     }
        //     throw err;
        // }
    }

    protected getTransactionConfigAndAmount(
        _receiverAddress?: string
    ): Promise<{ config: any; amount: string }> {
        // @TODO API
        throw new RubicSdkError('Not implemented');
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
}
