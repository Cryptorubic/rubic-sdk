import { Transaction } from '@mysten/sui/transactions';
import BigNumber from 'bignumber.js';
import { FailedToCheckForTransactionReceiptError, RubicSdkError } from 'src/common/errors';
import { PriceTokenAmount, Token } from 'src/common/tokens';
import { parseError } from 'src/common/utils/errors';
import { BLOCKCHAIN_NAME, SuiBlockchainName } from 'src/core/blockchain/models/blockchain-name';
import { EvmBasicTransactionOptions } from 'src/core/blockchain/web3-private-service/web3-private/evm-web3-private/models/evm-basic-transaction-options';
import { EvmTransactionOptions } from 'src/core/blockchain/web3-private-service/web3-private/evm-web3-private/models/evm-transaction-options';
import { SuiWeb3Private } from 'src/core/blockchain/web3-private-service/web3-private/sui-web3-private/sui-web3-private';
import { SuiWeb3Public } from 'src/core/blockchain/web3-public-service/web3-public/sui-web3-public/sui-web3-public';
import { SuiEncodeConfig } from 'src/core/blockchain/web3-pure/typed-web3-pure/sui-web3-pure/sui-encode-config';
import { Injector } from 'src/core/injector/injector';
import { EncodeTransactionOptions } from 'src/features/common/models/encode-transaction-options';
import { SwapTransactionOptions } from 'src/features/common/models/swap-transaction-options';
import { FeeInfo } from 'src/features/cross-chain/calculation-manager/providers/common/models/fee-info';
import { IsDeflationToken } from 'src/features/deflation-token-manager/models/is-deflation-token';
import { GasFeeInfo } from 'src/features/on-chain/calculation-manager/providers/common/on-chain-trade/evm-on-chain-trade/models/gas-fee-info';
import { OnChainTrade } from 'src/features/on-chain/calculation-manager/providers/common/on-chain-trade/on-chain-trade';
import { TransactionConfig } from 'web3-core';
import { TransactionReceipt } from 'web3-eth';

import { SuiOnChainTradeStruct } from './models/sui-on-chain-trade-struct';

export abstract class SuiOnChainTrade extends OnChainTrade {
    public readonly from: PriceTokenAmount<SuiBlockchainName>;

    public readonly to: PriceTokenAmount<SuiBlockchainName>;

    public readonly slippageTolerance: number;

    public readonly path: ReadonlyArray<Token>;

    /**
     * Gas fee info, including gas limit and gas price.
     */
    public readonly gasFeeInfo: GasFeeInfo | null;

    public readonly feeInfo: FeeInfo;

    /**
     * True, if trade must be swapped through on-chain proxy contract.
     */
    public readonly useProxy: boolean;

    /**
     * Contains from amount, from which proxy fees were subtracted.
     * If proxy is not used, then amount is equal to from amount.
     */
    protected readonly fromWithoutFee: PriceTokenAmount<SuiBlockchainName>;

    protected readonly withDeflation: {
        from: IsDeflationToken;
        to: IsDeflationToken;
    };

    protected get spenderAddress(): string {
        throw new RubicSdkError('No spender address!');
    }

    public abstract readonly dexContractAddress: string; // not static because https://github.com/microsoft/TypeScript/issues/34516

    protected get web3Public(): SuiWeb3Public {
        return Injector.web3PublicService.getWeb3Public(BLOCKCHAIN_NAME.SUI);
    }

    protected get web3Private(): SuiWeb3Private {
        return Injector.web3PrivateService.getWeb3PrivateByBlockchain(BLOCKCHAIN_NAME.SUI);
    }

    protected constructor(tradeStruct: SuiOnChainTradeStruct, providerAddress: string) {
        super(providerAddress);

        this.from = tradeStruct.from;
        this.to = tradeStruct.to;

        this.slippageTolerance = tradeStruct.slippageTolerance;
        this.path = tradeStruct.path;

        this.gasFeeInfo = tradeStruct.gasFeeInfo;

        this.useProxy = false;
        this.fromWithoutFee = tradeStruct.fromWithoutFee;

        this.feeInfo = {};
        this.withDeflation = tradeStruct.withDeflation;
    }

    public async approve(
        _options: EvmBasicTransactionOptions,
        _checkNeedApprove = true,
        _amount: BigNumber | 'infinity' = 'infinity'
    ): Promise<TransactionReceipt> {
        throw new Error('Method is not supported');
    }

    public async encodeApprove(
        _tokenAddress: string,
        _spenderAddress: string,
        _value: BigNumber | 'infinity',
        _options: EvmTransactionOptions = {}
    ): Promise<TransactionConfig> {
        throw new Error('Method is not supported');
    }

    protected async checkAllowanceAndApprove(): Promise<void> {
        throw new Error('Method is not supported');
    }

    public async swap(options: SwapTransactionOptions = {}): Promise<string | never> {
        await this.checkWalletState(options?.testMode);

        const { onConfirm } = options;
        let transactionHash: string;
        const onTransactionHash = (hash: string) => {
            if (onConfirm) {
                onConfirm(hash);
            }
            transactionHash = hash;
        };

        const fromAddress = this.walletAddress;
        const receiverAddress = options.receiverAddress || this.walletAddress;

        const transactionConfig = await this.encode({
            fromAddress,
            receiverAddress,
            ...options
        });

        try {
            await this.web3Private.sendTransaction({
                transactionBlock: Transaction.from(transactionConfig.transaction),
                onTransactionHash
            });

            return transactionHash!;
        } catch (err) {
            if (err instanceof FailedToCheckForTransactionReceiptError) {
                return transactionHash!;
            }

            throw parseError(err);
        }
    }

    public async encode(options: EncodeTransactionOptions): Promise<SuiEncodeConfig> {
        await this.checkFromAddress(options.fromAddress, true);
        await this.checkReceiverAddress(options.receiverAddress);

        return this.encodeDirect(options);
    }

    /**
     * Encodes trade to swap it directly through dex contract.
     */
    public abstract encodeDirect(options: EncodeTransactionOptions): Promise<SuiEncodeConfig>;
}
