import { RubicSdkError } from 'src/common/errors';
import { PriceTokenAmount, Token } from 'src/common/tokens';
import { parseError } from 'src/common/utils/errors';
import { BLOCKCHAIN_NAME, TonBlockchainName } from 'src/core/blockchain/models/blockchain-name';
import { TonEncodedConfig } from 'src/core/blockchain/web3-private-service/web3-private/ton-web3-private/models/ton-types';
import { TonWeb3Private } from 'src/core/blockchain/web3-private-service/web3-private/ton-web3-private/ton-web3-private';
import { TonWeb3Public } from 'src/core/blockchain/web3-public-service/web3-public/ton-web3-public/ton-web3-public';
import { Injector } from 'src/core/injector/injector';
import { EncodeTransactionOptions } from 'src/features/common/models/encode-transaction-options';
import { SwapTransactionOptions } from 'src/features/common/models/swap-transaction-options';
import { FeeInfo } from 'src/features/cross-chain/calculation-manager/providers/common/models/fee-info';
import { TransactionConfig } from 'web3-core';

import { OnChainTradeStruct } from '../evm-on-chain-trade/models/evm-on-chain-trade-struct';
import { GasFeeInfo } from '../evm-on-chain-trade/models/gas-fee-info';
import { OnChainTrade } from '../on-chain-trade';

export abstract class TonOnChainTrade extends OnChainTrade {
    public readonly from: PriceTokenAmount;

    public readonly to: PriceTokenAmount;

    public readonly slippageTolerance: number;

    public readonly path: ReadonlyArray<Token>;

    public readonly feeInfo: FeeInfo = {};

    public readonly gasFeeInfo: GasFeeInfo | null;

    protected get spenderAddress(): string {
        throw new RubicSdkError('No spender address!');
    }

    protected get web3Public(): TonWeb3Public {
        return Injector.web3PublicService.getWeb3Public(BLOCKCHAIN_NAME.TON);
    }

    protected get web3Private(): TonWeb3Private {
        return Injector.web3PrivateService.getWeb3PrivateByBlockchain(BLOCKCHAIN_NAME.TON);
    }

    constructor(tradeStruct: OnChainTradeStruct<TonBlockchainName>, providerAddress: string) {
        super(providerAddress);
        this.from = tradeStruct.from;
        this.to = tradeStruct.to;
        this.slippageTolerance = tradeStruct.slippageTolerance;
        this.gasFeeInfo = tradeStruct.gasFeeInfo;
        this.path = tradeStruct.path;
    }

    public override async needApprove(): Promise<boolean> {
        return false;
    }

    public async approve(): Promise<void> {
        throw new RubicSdkError('Method not implemented!');
    }

    public async encodeApprove(): Promise<TransactionConfig> {
        throw new Error('Method is not supported');
    }

    public async swap(options: SwapTransactionOptions = {}): Promise<string> {
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

        const tonEncodedConfig = await this.encode({
            fromAddress,
            receiverAddress,
            ...(options?.referrer && { referrer: options?.referrer })
        });

        try {
            await this.web3Private.sendTransaction({
                onTransactionHash,
                messages: [tonEncodedConfig]
            });
            return transactionHash!;
        } catch (err) {
            throw parseError(err);
        }
    }

    public async encode(options: EncodeTransactionOptions): Promise<TonEncodedConfig> {
        await this.checkFromAddress(options.fromAddress);
        await this.checkReceiverAddress(options.receiverAddress);

        return this.encodeDirect(options);
    }

    public abstract encodeDirect(options: EncodeTransactionOptions): Promise<TonEncodedConfig>;
}
