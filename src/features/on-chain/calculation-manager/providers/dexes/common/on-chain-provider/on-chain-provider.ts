import { Web3Public } from 'src/core/blockchain/web3-public-service/web3-public/web3-public';
import { BlockchainName } from 'src/core/blockchain/models/blockchain-name';
import { OnChainCalculationOptions } from 'src/features/on-chain/calculation-manager/providers/common/models/on-chain-calculation-options';
import { PriceToken, PriceTokenAmount } from 'src/common/tokens';
import { OnChainTrade } from 'src/features/on-chain/calculation-manager/providers/common/on-chain-trade/on-chain-trade';
import { Injector } from 'src/core/injector/injector';
import { OnChainTradeType } from 'src/features/on-chain/calculation-manager/providers/common/models/on-chain-trade-type';
import { HttpClient } from 'src/core/http-client/models/http-client';
import { RubicSdkError } from 'src/common/errors';
import { parseError } from 'src/common/utils/errors';

/**
 * Abstract class for all on-chain trade providers.
 */
export abstract class OnChainProvider {
    public static parseError(err: unknown): RubicSdkError {
        return parseError(err, 'Cannot calculate on-chain trade');
    }

    /**
     * Provider blockchain.
     */
    public abstract readonly blockchain: BlockchainName;

    public readonly supportReceiverAddress: boolean = true;

    /**
     * Type of provider.
     */
    public abstract get type(): OnChainTradeType;

    protected abstract get walletAddress(): string;

    protected get web3Public(): Web3Public {
        return Injector.web3PublicService.getWeb3Public(this.blockchain);
    }

    protected get httpClient(): HttpClient {
        return Injector.httpClient;
    }

    /**
     * Calculates on-chain trade.
     * @param from Token to sell with input amount.
     * @param to Token to get.
     * @param options Additional options.
     */
    public abstract calculate(
        from: PriceTokenAmount,
        to: PriceToken,
        options?: OnChainCalculationOptions
    ): Promise<OnChainTrade>;
}
