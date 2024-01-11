import { PriceToken, PriceTokenAmount, Token } from 'src/common/tokens';
import { BlockchainName, EvmBlockchainName } from 'src/core/blockchain/models/blockchain-name';
import { getFromWithoutFee } from 'src/features/common/utils/get-from-without-fee';

import { OnChainTradeError } from '../../../models/on-chain-trade-error';
import { RequiredOnChainCalculationOptions } from '../models/on-chain-calculation-options';
import { OnChainProxyFeeInfo } from '../models/on-chain-proxy-fee-info';
import { OnChainProxyService } from '../on-chain-proxy-service/on-chain-proxy-service';
import { EvmOnChainTradeStruct } from '../on-chain-trade/evm-on-chain-trade/models/evm-on-chain-trade-struct';
import { GasFeeInfo } from '../on-chain-trade/evm-on-chain-trade/models/gas-fee-info';
import { OnChainTrade } from '../on-chain-trade/on-chain-trade';

export abstract class AggregatorOnChain {
    private readonly onChainProxyService = new OnChainProxyService();

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

    protected async handleProxyContract(
        from: PriceTokenAmount<EvmBlockchainName>,
        fullOptions: RequiredOnChainCalculationOptions
    ): Promise<{
        fromWithoutFee: PriceTokenAmount<EvmBlockchainName>;
        proxyFeeInfo: OnChainProxyFeeInfo | undefined;
    }>;
    protected async handleProxyContract(
        from: PriceTokenAmount<BlockchainName>,
        fullOptions: RequiredOnChainCalculationOptions
    ): Promise<{
        fromWithoutFee: PriceTokenAmount<BlockchainName>;
        proxyFeeInfo: OnChainProxyFeeInfo | undefined;
    }> {
        let fromWithoutFee: PriceTokenAmount<BlockchainName>;
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
