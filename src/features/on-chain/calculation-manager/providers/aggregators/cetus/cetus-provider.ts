import { initCetusSDK } from '@cetusprotocol/cetus-sui-clmm-sdk';
import BigNumber from 'bignumber.js';
import { PriceToken, PriceTokenAmount } from 'src/common/tokens';
import { Any } from 'src/common/utils/types';
import {
    BLOCKCHAIN_NAME,
    BlockchainName,
    SuiBlockchainName
} from 'src/core/blockchain/models/blockchain-name';
import { OnChainTradeError } from 'src/features/on-chain/calculation-manager/models/on-chain-trade-error';
import { CetusTrade } from 'src/features/on-chain/calculation-manager/providers/aggregators/cetus/cetus-trade';
import { CetusTradeStruct } from 'src/features/on-chain/calculation-manager/providers/aggregators/cetus/models/cetus-trade-struct';
import { RequiredOnChainCalculationOptions } from 'src/features/on-chain/calculation-manager/providers/common/models/on-chain-calculation-options';
import { ON_CHAIN_TRADE_TYPE } from 'src/features/on-chain/calculation-manager/providers/common/models/on-chain-trade-type';
import { AggregatorOnChainProvider } from 'src/features/on-chain/calculation-manager/providers/common/on-chain-aggregator/aggregator-on-chain-provider-abstract';
import { OnChainTrade } from 'src/features/on-chain/calculation-manager/providers/common/on-chain-trade/on-chain-trade';

export class CetusProvider extends AggregatorOnChainProvider {
    public readonly tradeType = ON_CHAIN_TRADE_TYPE.CETUS;

    public static readonly swapSdk = initCetusSDK({ network: 'mainnet' });

    public isSupportedBlockchain(blockchain: BlockchainName): boolean {
        return blockchain === BLOCKCHAIN_NAME.SUI;
    }

    public async calculate(
        from: PriceTokenAmount<SuiBlockchainName>,
        toToken: PriceToken<SuiBlockchainName>,
        options: RequiredOnChainCalculationOptions
    ): Promise<OnChainTrade | OnChainTradeError> {
        try {
            const { fromWithoutFee } = await this.handleProxyContract(from, options);

            const route = await CetusProvider.swapSdk.RouterV2.getBestRouter(
                from.address,
                toToken.address,
                from.stringWeiAmount as Any,
                true,
                options.slippageTolerance,
                ''
            );

            const to = new PriceTokenAmount({
                ...toToken.asStruct,
                weiAmount: new BigNumber(route.result.outputAmount)
            });

            const tradeStruct: CetusTradeStruct = {
                from,
                to,
                slippageTolerance: options.slippageTolerance!,
                gasFeeInfo: null,
                useProxy: options.useProxy,
                withDeflation: options.withDeflation,
                aggregatorResult: route.result,
                fromWithoutFee: fromWithoutFee,
                path: [from, toToken]
            };

            return new CetusTrade(tradeStruct, options.providerAddress);
        } catch (error) {
            return {
                type: ON_CHAIN_TRADE_TYPE.OPEN_OCEAN,
                error
            };
        }
    }
}
