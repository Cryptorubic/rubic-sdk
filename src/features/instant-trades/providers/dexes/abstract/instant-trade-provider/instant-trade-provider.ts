import { Web3Public } from 'src/core/blockchain/web3-public-service/web3-public/web3-public';
import { BlockchainName } from 'src/core/blockchain/models/blockchain-name';
import { CalculationOptions } from 'src/features/instant-trades/providers/models/calculation-options';
import { PriceToken, PriceTokenAmount } from 'src/common/tokens';
import { InstantTrade } from 'src/features/instant-trades/providers/abstract/instant-trade';
import { Injector } from 'src/core/injector/injector';
import { TradeType } from 'src/features/instant-trades/providers/models/trade-type';
import { HttpClient } from 'src/core/http-client/models/http-client';
import { RubicSdkError } from 'src/common/errors';
import { parseError } from 'src/common/utils/errors';

/**
 * Abstract class for all instant trade providers.
 */
export abstract class InstantTradeProvider {
    public static parseError(err: unknown): RubicSdkError {
        return parseError(err, 'Cannot calculate instant trade');
    }

    /**
     * Provider blockchain.
     */
    public abstract readonly blockchain: BlockchainName;

    /**
     * Type of provider.
     */
    public abstract get type(): TradeType;

    protected abstract get walletAddress(): string;

    protected get web3Public(): Web3Public {
        return Injector.web3PublicService.getWeb3Public(this.blockchain);
    }

    protected get httpClient(): HttpClient {
        return Injector.httpClient;
    }

    /**
     * Calculates instant trade.
     * @param from Token to sell with input amount.
     * @param to Token to get.
     * @param options Additional options.
     */
    public abstract calculate(
        from: PriceTokenAmount,
        to: PriceToken,
        options?: CalculationOptions
    ): Promise<InstantTrade>;
}
