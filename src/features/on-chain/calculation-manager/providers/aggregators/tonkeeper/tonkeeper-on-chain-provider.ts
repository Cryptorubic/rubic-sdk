import BigNumber from 'bignumber.js';
import { PriceToken, PriceTokenAmount } from 'src/common/tokens';
import {
    BLOCKCHAIN_NAME,
    BlockchainName,
    TonBlockchainName
} from 'src/core/blockchain/models/blockchain-name';
import { TonUtils } from 'src/core/blockchain/services/ton/ton-utils';

import { OnChainTradeError } from '../../../models/on-chain-trade-error';
import { RequiredOnChainCalculationOptions } from '../../common/models/on-chain-calculation-options';
import { ON_CHAIN_TRADE_TYPE } from '../../common/models/on-chain-trade-type';
import { AggregatorOnChainProvider } from '../../common/on-chain-aggregator/aggregator-on-chain-provider-abstract';
import { OnChainTradeStruct } from '../../common/on-chain-trade/evm-on-chain-trade/models/evm-on-chain-trade-struct';
import { GasFeeInfo } from '../../common/on-chain-trade/evm-on-chain-trade/models/gas-fee-info';
import { OnChainTrade } from '../../common/on-chain-trade/on-chain-trade';
import { TonkeeperApiService } from './services/tonkeeper-api-service';
import { TonkeeperOnChainTrade } from './tonkeeper-on-chain-trade';

export class TonkeeperOnChainProvider extends AggregatorOnChainProvider {
    public readonly tradeType = ON_CHAIN_TRADE_TYPE.TONKEEPER;

    public isSupportedBlockchain(blockchain: BlockchainName): blockchain is TonBlockchainName {
        return blockchain === BLOCKCHAIN_NAME.TON;
    }

    public async calculate(
        from: PriceTokenAmount,
        toToken: PriceToken,
        options: RequiredOnChainCalculationOptions
    ): Promise<OnChainTrade | OnChainTradeError> {
        const [fromRawAddress, toRawAddress, { fromWithoutFee, proxyFeeInfo }] = await Promise.all([
            (await TonUtils.getAllFormatsOfAddress(from.address)).raw_form,
            (await TonUtils.getAllFormatsOfAddress(toToken.address)).raw_form,
            this.handleProxyContract(from, options)
        ]);

        const bestRoute = await TonkeeperApiService.makeQuoteReq(
            fromRawAddress,
            toRawAddress,
            fromWithoutFee.stringWeiAmount
        );
        const to = new PriceTokenAmount({
            ...toToken.asStruct,
            weiAmount: new BigNumber(bestRoute.trades[0].toAmount)
        });

        const tradeStruct = {
            from,
            to,
            slippageTolerance: options.slippageTolerance,
            useProxy: false,
            withDeflation: options.withDeflation,
            gasFeeInfo: null,
            path: this.getRoutePath(from, toToken),
            proxyFeeInfo,
            fromWithoutFee
        } as OnChainTradeStruct<TonBlockchainName>;

        return new TonkeeperOnChainTrade(tradeStruct, options.providerAddress);
    }

    protected async getGasFeeInfo(
        _tradeStruct: OnChainTradeStruct<BlockchainName>,
        _providerGateway?: string
    ): Promise<GasFeeInfo | null> {
        return null;
    }
}
