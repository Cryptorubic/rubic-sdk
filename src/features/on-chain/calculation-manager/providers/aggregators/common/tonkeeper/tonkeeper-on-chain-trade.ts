import { parseError } from 'src/common/utils/errors';
import { TonEncodedConfig } from 'src/core/blockchain/web3-private-service/web3-private/ton-web3-private/models/ton-types';
import { EncodeTransactionOptions } from 'src/features/common/models/encode-transaction-options';
import { SwapTransactionOptions } from 'src/features/common/models/swap-transaction-options';

import { OnChainTradeType } from '../../../common/models/on-chain-trade-type';
import { TonOnChainTrade } from '../../../common/on-chain-trade/ton-on-chain-trade/ton-on-chain-trade';
import {
    TonkeeperCommonQuoteInfo,
    TonkeeperDexType,
    TonkeeperQuoteResp
} from './models/tonkeeper-api-types';
import { TonkeeperOnChainTradeStruct, TxTokensRawAddresses } from './models/tonkeeper-trade-struct';
import { TonkeeperApiService } from './services/tonkeeper-api-service';

export class TonkeeperOnChainTrade<
    T extends TonkeeperCommonQuoteInfo
> extends TonOnChainTrade<TonEncodedConfig> {
    public type: OnChainTradeType;

    private readonly bestRoute: TonkeeperQuoteResp<T>;

    private readonly rawAddresses: TxTokensRawAddresses;

    private readonly tonkeeperDexType: TonkeeperDexType;

    constructor(tradeStruct: TonkeeperOnChainTradeStruct<T>, providerAddress: string) {
        super(tradeStruct, providerAddress);

        this.bestRoute = tradeStruct.bestRoute;
        this.rawAddresses = tradeStruct.rawAddresses;
        this.type = tradeStruct.tradeType;
        this.tonkeeperDexType = tradeStruct.tonkeeperDexType;
    }

    public async swap(options: SwapTransactionOptions = {}): Promise<string> {
        await this.checkWalletState(options?.testMode);

        let transactionHash: string;
        const onTransactionHash = (hash: string) => {
            if (options.onConfirm) {
                options.onConfirm(hash);
            }
            transactionHash = hash;
        };

        const fromAddress = this.walletAddress;
        const receiverAddress = options.receiverAddress || this.walletAddress;

        await this.makePreSwapChecks({
            fromAddress,
            receiverAddress,
            skipAmountCheck: this.skipAmountCheck,
            ...(options?.referrer && { referrer: options?.referrer })
        });

        const tonEncodedConfig = await this.encodeDirect();

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

    private async encodeDirect(): Promise<TonEncodedConfig> {
        const { body, to, value } = await TonkeeperApiService.encodeParamsForSwap(
            this.bestRoute,
            this.walletAddress,
            this.slippageTolerance
        );
        return {
            address: to,
            amount: value,
            payload: body
        };
    }

    protected async calculateOutputAmount(_options: EncodeTransactionOptions): Promise<string> {
        const bestRoute = await TonkeeperApiService.makeQuoteReq(
            this.rawAddresses.fromRawAddress,
            this.rawAddresses.toRawAddress,
            this.from.stringWeiAmount,
            this.tonkeeperDexType
        );

        return bestRoute.trades[0].toAmount;
    }
}
