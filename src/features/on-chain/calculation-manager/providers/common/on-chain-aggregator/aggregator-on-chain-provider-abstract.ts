import { PriceToken, PriceTokenAmount, Token } from 'src/common/tokens';
import { BlockchainName, EvmBlockchainName } from 'src/core/blockchain/models/blockchain-name';
import { BlockchainsInfo } from 'src/core/blockchain/utils/blockchains-info/blockchains-info';
import { Web3PrivateSupportedBlockchain } from 'src/core/blockchain/web3-private-service/models/web-private-supported-blockchain';
import { Injector } from 'src/core/injector/injector';
import { getFromWithoutFee } from 'src/features/common/utils/get-from-without-fee';

import { OnChainTradeError } from '../../../models/on-chain-trade-error';
import { RequiredOnChainCalculationOptions } from '../models/on-chain-calculation-options';
import { OnChainProxyFeeInfo } from '../models/on-chain-proxy-fee-info';
import { OnChainTradeType } from '../models/on-chain-trade-type';
import { OnChainProxyService } from '../on-chain-proxy-service/on-chain-proxy-service';
import { GasFeeInfo } from '../on-chain-trade/evm-on-chain-trade/models/gas-fee-info';
import { OnChainTrade } from '../on-chain-trade/on-chain-trade';

export abstract class AggregatorOnChainProvider {
    private readonly onChainProxyService = new OnChainProxyService();

    public abstract readonly tradeType: OnChainTradeType;

    public abstract calculate(
        from: PriceTokenAmount,
        toToken: PriceToken,
        options: RequiredOnChainCalculationOptions
    ): Promise<OnChainTrade | OnChainTradeError>;

    public abstract isSupportedBlockchain(blockchain: BlockchainName): boolean;

    protected getWalletAddress(blockchain: Web3PrivateSupportedBlockchain): string {
        return Injector.web3PrivateService.getWeb3PrivateByBlockchain(blockchain).address;
    }

    protected getGasFeeInfo(..._args: unknown[]): Promise<GasFeeInfo | null> {
        return Promise.resolve(null);
    }

    protected async handleProxyContract<T extends BlockchainName>(
        from: PriceTokenAmount<T>,
        fullOptions: RequiredOnChainCalculationOptions
    ): Promise<{
        fromWithoutFee: PriceTokenAmount<T>;
        proxyFeeInfo: OnChainProxyFeeInfo | undefined;
    }> {
        let fromWithoutFee: PriceTokenAmount<T>;
        let proxyFeeInfo: OnChainProxyFeeInfo | undefined;

        if (fullOptions.useProxy && BlockchainsInfo.isEvmBlockchainName(from.blockchain)) {
            proxyFeeInfo = await this.onChainProxyService.getFeeInfo(
                from as PriceTokenAmount<EvmBlockchainName>,
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
