import { Cache } from 'src/common/utils/decorators';
import { TonEncodedConfig } from 'src/core/blockchain/web3-private-service/web3-private/ton-web3-private/models/ton-types';
import { EncodeTransactionOptions } from 'src/features/common/models/encode-transaction-options';
import { checkUnsupportedReceiverAddress } from 'src/features/common/utils/check-unsupported-receiver-address';

import { ON_CHAIN_TRADE_TYPE } from '../../common/models/on-chain-trade-type';
import { TonEncodedConfigAndToAmount } from '../../common/on-chain-trade/ton-on-chain-trade/models/ton--on-chian-trade-types';
import { TonOnChainTrade } from '../../common/on-chain-trade/ton-on-chain-trade/ton-on-chain-trade';
import { TonkeeperQuoteResp } from './models/tonkeeper-api-types';
import { TonkeeperOnChainTradeStruct, TxTokensRawAddresses } from './models/tonkeeper-trade-struct';
import { TonkeeperApiService } from './services/tonkeeper-api-service';

export class TonkeeperOnChainTrade extends TonOnChainTrade {
    public type = ON_CHAIN_TRADE_TYPE.TONKEEPER;

    private readonly bestRoute: TonkeeperQuoteResp;

    private readonly rawAddresses: TxTokensRawAddresses;

    constructor(tradeStruct: TonkeeperOnChainTradeStruct, providerAddress: string) {
        super(tradeStruct, providerAddress);
        this.bestRoute = tradeStruct.bestRoute;
        this.rawAddresses = tradeStruct.rawAddresses;
    }

    public async encodeDirect(options: EncodeTransactionOptions): Promise<TonEncodedConfig> {
        checkUnsupportedReceiverAddress(options.receiverAddress, this.walletAddress);
        const { tx } = await this.getTransactionConfigAndAmount(options);
        return tx;
    }

    @Cache({ maxAge: 15_000 })
    protected async getTransactionConfigAndAmount(
        options: EncodeTransactionOptions
    ): Promise<TonEncodedConfigAndToAmount> {
        const [newBestRoute, { body, to, value }] = await Promise.all([
            TonkeeperApiService.makeQuoteReq(
                this.rawAddresses.fromRawAddress,
                this.rawAddresses.toRawAddress,
                this.fromWithoutFee.stringWeiAmount
            ),
            TonkeeperApiService.encodeParamsForSwap(
                this.bestRoute,
                options.receiverAddress || this.walletAddress,
                this.slippageTolerance
            )
        ]);

        return {
            tx: {
                address: to,
                amount: value,
                payload: body
            },
            toAmount: newBestRoute.trades[0].toAmount
        };
    }
}
