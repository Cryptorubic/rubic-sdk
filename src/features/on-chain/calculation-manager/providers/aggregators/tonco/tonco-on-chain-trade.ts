import { parseError } from 'src/common/utils/errors';
import { EncodeTransactionOptions } from 'src/features/common/models/encode-transaction-options';
import { SwapTransactionOptions } from 'src/features/common/models/swap-transaction-options';

import { ON_CHAIN_TRADE_TYPE } from '../../common/models/on-chain-trade-type';
import { TonOnChainTrade } from '../../common/on-chain-trade/ton-on-chain-trade/ton-on-chain-trade';
import { ToncoCommonParams } from './models/tonco-facade-types';
import { ToncoOnChainTradeStruct } from './models/tonco-trade-types';
import { ToncoSdkFacade } from './services/tonco-sdk-facade';

export class ToncoOnChainTrade extends TonOnChainTrade {
    public readonly type = ON_CHAIN_TRADE_TYPE.TONCO_DEX;

    private readonly params: ToncoCommonParams;

    constructor(tradeStruct: ToncoOnChainTradeStruct, providerAddress: string) {
        super(tradeStruct, providerAddress);
        this.params = tradeStruct.params;
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

        const tonEncodedConfig = await ToncoSdkFacade.createTonConfig(
            this.params,
            this.from.weiAmount,
            this.to.weiAmountMinusSlippage(this.slippageTolerance)
        );

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

    protected async calculateOutputAmount(_options: EncodeTransactionOptions): Promise<string> {
        const amountOutWei = await ToncoSdkFacade.calculateAmountOut(this.params, this.from);
        return amountOutWei.toFixed();
    }
}
