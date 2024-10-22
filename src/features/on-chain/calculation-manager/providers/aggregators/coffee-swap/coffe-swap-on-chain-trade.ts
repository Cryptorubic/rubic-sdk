import { PriceTokenAmount } from 'src/common/tokens';
import { parseError } from 'src/common/utils/errors';
import { TonBlockchainName } from 'src/core/blockchain/models/blockchain-name';
import { TonEncodedConfig } from 'src/core/blockchain/web3-private-service/web3-private/ton-web3-private/models/ton-types';
import { Web3Pure } from 'src/core/blockchain/web3-pure/web3-pure';
import { EncodeTransactionOptions } from 'src/features/common/models/encode-transaction-options';
import { SwapTransactionOptions } from 'src/features/common/models/swap-transaction-options';

import { ON_CHAIN_TRADE_TYPE } from '../../common/models/on-chain-trade-type';
import { TonOnChainTrade } from '../../common/on-chain-trade/ton-on-chain-trade/ton-on-chain-trade';
import { FAKE_TON_ADDRESS } from './constants/fake-ton-wallet';
import { CoffeeRoutePath } from './models/coffe-swap-api-types';
import { CoffeeSwapTradeStruct } from './models/coffee-swap-trade-types';
import { CoffeeSwapApiService } from './services/coffee-swap-api-service';

export class CoffeSwapTrade extends TonOnChainTrade<TonEncodedConfig> {
    public readonly type = ON_CHAIN_TRADE_TYPE.COFFEE_SWAP;

    private readonly txSteps: CoffeeRoutePath[];

    constructor(tradeStruct: CoffeeSwapTradeStruct, providerAddress: string) {
        super(tradeStruct, providerAddress);
        this.txSteps = tradeStruct.txSteps;
    }

    public async swap(options: SwapTransactionOptions = {}): Promise<string | never> {
        let transactionHash: string;
        const onTransactionHash = (hash: string) => {
            if (options.onConfirm) {
                options.onConfirm(hash);
            }
            transactionHash = hash;
        };

        await this.checkWalletState(options?.testMode);
        await this.makePreSwapChecks({
            fromAddress: this.walletAddress,
            receiverAddress: options.receiverAddress,
            skipAmountCheck: this.skipAmountCheck,
            ...(options?.referrer && { referrer: options?.referrer })
        });

        const tonConfigs = await this.encodeDirect();

        try {
            await this.web3Private.sendTransaction({
                onTransactionHash,
                messages: tonConfigs
            });
            return transactionHash!;
        } catch (err) {
            throw parseError(err);
        }
    }

    private async encodeDirect(): Promise<TonEncodedConfig[]> {
        const tonConfigs = await CoffeeSwapApiService.fetchTonEncodedConfigs(
            this.walletAddress,
            this.slippageTolerance,
            this.txSteps
        );

        return tonConfigs;
    }

    protected async calculateOutputAmount(options: EncodeTransactionOptions): Promise<string> {
        const newQuote = await CoffeeSwapApiService.fetchQuote({
            srcToken: this.from as PriceTokenAmount<TonBlockchainName>,
            dstToken: this.to as PriceTokenAmount<TonBlockchainName>,
            walletAddress: options.fromAddress || FAKE_TON_ADDRESS
        });

        return Web3Pure.toWei(newQuote.output_amount, this.to.decimals);
    }
}
