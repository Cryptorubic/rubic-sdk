import BigNumber from 'bignumber.js';
import { RubicSdkError } from 'src/common/errors';
import { PriceTokenAmount } from 'src/common/tokens';
import { BLOCKCHAIN_NAME, TonBlockchainName } from 'src/core/blockchain/models/blockchain-name';
import { EvmBasicTransactionOptions } from 'src/core/blockchain/web3-private-service/web3-private/evm-web3-private/models/evm-basic-transaction-options';
import { EvmTransactionOptions } from 'src/core/blockchain/web3-private-service/web3-private/evm-web3-private/models/evm-transaction-options';
import { TonWeb3Private } from 'src/core/blockchain/web3-private-service/web3-private/ton-web3-private/ton-web3-private';
import { TonWeb3Public } from 'src/core/blockchain/web3-public-service/web3-public/ton-web3-public/ton-web3-public';
import { EvmEncodeConfig } from 'src/core/blockchain/web3-pure/typed-web3-pure/evm-web3-pure/models/evm-encode-config';
import { Injector } from 'src/core/injector/injector';
import { ContractParams } from 'src/features/common/models/contract-params';
import { EncodeTransactionOptions } from 'src/features/common/models/encode-transaction-options';
import { SwapTransactionOptions } from 'src/features/common/models/swap-transaction-options';
import { CrossChainTrade } from 'src/features/cross-chain/calculation-manager/providers/common/cross-chain-trade';
import { GetContractParamsOptions } from 'src/features/cross-chain/calculation-manager/providers/common/models/get-contract-params-options';
import { TransactionConfig } from 'web3-core';
import { TransactionReceipt } from 'web3-eth';

export abstract class TonCrossChainTrade extends CrossChainTrade<EvmEncodeConfig> {
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

    public async approve(
        _options: EvmBasicTransactionOptions,
        _checkNeedApprove = true,
        _amount: BigNumber | 'infinity' = 'infinity'
    ): Promise<TransactionReceipt> {
        throw new RubicSdkError('Method not implemented!');
    }

    protected async checkAllowanceAndApprove(
        _options?: Omit<SwapTransactionOptions, 'onConfirm' | 'gasLimit'>
    ): Promise<void> {
        return;
    }

    public async encode(_options: EncodeTransactionOptions): Promise<EvmEncodeConfig> {
        throw new RubicSdkError(
            'Method not implemented! Use custom swap methods on each child class!'
        );
    }

    public async encodeApprove(
        _tokenAddress: string,
        _spenderAddress: string,
        _value: BigNumber | 'infinity',
        _options: EvmTransactionOptions = {}
    ): Promise<TransactionConfig> {
        throw new Error('Method not implemented');
    }

    protected abstract getContractParams(
        options: GetContractParamsOptions,
        skipAmountChangeCheck?: boolean
    ): Promise<ContractParams>;

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
