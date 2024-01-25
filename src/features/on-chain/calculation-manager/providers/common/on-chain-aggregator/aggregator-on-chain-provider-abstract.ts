import { PriceToken, PriceTokenAmount, Token } from 'src/common/tokens';
import { BlockchainName } from 'src/core/blockchain/models/blockchain-name';
import { getFromWithoutFee } from 'src/features/common/utils/get-from-without-fee';

import { OnChainTradeError } from '../../../models/on-chain-trade-error';
import { RequiredOnChainCalculationOptions } from '../models/on-chain-calculation-options';
import { OnChainProxyFeeInfo } from '../models/on-chain-proxy-fee-info';
import { OnChainTradeType } from '../models/on-chain-trade-type';
import { OnChainProxyService } from '../on-chain-proxy-service/on-chain-proxy-service';
import { EvmOnChainTradeStruct } from '../on-chain-trade/evm-on-chain-trade/models/evm-on-chain-trade-struct';
import { GasFeeInfo } from '../on-chain-trade/evm-on-chain-trade/models/gas-fee-info';
import { OnChainTrade } from '../on-chain-trade/on-chain-trade';

export abstract class AggregatorOnChainProvider {
    private readonly onChainProxyService = new OnChainProxyService();

    public abstract readonly tradeType: OnChainTradeType;

    public abstract calculate(
        from: PriceTokenAmount<BlockchainName>,
        toToken: PriceToken<BlockchainName>,
        options: RequiredOnChainCalculationOptions
    ): Promise<OnChainTrade | OnChainTradeError>;

    protected abstract isSupportedBlockchain(blockchain: BlockchainName): boolean;

    protected abstract getGasFeeInfo(
        tradeStruct: EvmOnChainTradeStruct,
        providerGateway?: string
    ): Promise<GasFeeInfo | null>;

    protected async handleProxyContract<T extends BlockchainName>(
        from: PriceTokenAmount<T>,
        fullOptions: RequiredOnChainCalculationOptions
    ): Promise<{
        fromWithoutFee: PriceTokenAmount<T>;
        proxyFeeInfo: OnChainProxyFeeInfo | undefined;
    }> {
        let fromWithoutFee: PriceTokenAmount<T>;
        let proxyFeeInfo: OnChainProxyFeeInfo | undefined;

        if (fullOptions.useProxy) {
            proxyFeeInfo = await this.onChainProxyService.getFeeInfo(
                from,
                fullOptions.providerAddress
            );
            fromWithoutFee = getFromWithoutFee(from, proxyFeeInfo.platformFee.percent);
        } else {
            fromWithoutFee = from;
        }

        return {
            fromWithoutFee,
            proxyFeeInfo
        };
    }

    protected getRoutePath(from: Token, to: Token): ReadonlyArray<Token> {
        return [from, to];
    }
}
