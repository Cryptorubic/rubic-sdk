import { PriceToken, PriceTokenAmount } from 'src/core';
import { RequiredCrossChainOptions } from 'src/features/cross-chain/models/cross-chain-options';
import { CelerCrossChainTradeProvider } from 'src/features/cross-chain/providers/celer-trade-provider/celer-cross-chain-trade-provider';
import { NftCelerCrossChainTrade } from 'src/features/cross-chain/providers/nft-celer-trade-provider/nft-celer-cross-chain-trade';

import { CelerCrossChainTrade } from 'src/features';

export class NftCelerCrossChainTradeProvider {
    public async calculate(
        from: PriceTokenAmount,
        to: PriceToken,
        swapData: string,
        options: RequiredCrossChainOptions
    ) {
        const celerProvider = new CelerCrossChainTradeProvider();
        const wrappedCelerTrade = await celerProvider.calculate(from, to, options);

        if (!wrappedCelerTrade?.trade) {
            console.error('Could not calculate', wrappedCelerTrade?.error);
            return null;
        }
        const celerTrade = wrappedCelerTrade.trade as CelerCrossChainTrade;

        return new NftCelerCrossChainTrade(
            {
                fromTrade: celerTrade.fromTrade,
                toTrade: celerTrade.toTrade,
                cryptoFeeToken: celerTrade.cryptoFeeToken,
                transitFeeToken: celerTrade.transitFeeToken,
                gasData: celerTrade.gasData,
                feeInPercents: celerTrade.feeInPercents,
                swapData
            },
            options.providerAddress,
            celerTrade.maxSlippage
        );
    }
}
