import { InstantTradeProvider } from 'src/features/instant-trades/providers/dexes/abstract/instant-trade-provider/instant-trade-provider';
import { BLOCKCHAIN_NAME, TronBlockchainName } from 'src/core/blockchain/models/blockchain-name';
import { Injector } from 'src/core/injector/injector';
import { CHAIN_TYPE } from 'src/core/blockchain/models/chain-type';
import { PriceToken, PriceTokenAmount } from 'src/common/tokens';
import { CalculationOptions } from 'src/features/instant-trades/providers/models/calculation-options';
import { TronWeb3Public } from 'src/core/blockchain/web3-public-service/web3-public/tron-web3-public/tron-web3-public';
import { TronInstantTrade } from 'src/features/instant-trades/providers/abstract/tron-instant-trade/tron-instant-trade';

export abstract class TronInstantTradeProvider extends InstantTradeProvider {
    public readonly blockchain = BLOCKCHAIN_NAME.TRON;

    protected get walletAddress(): string {
        return Injector.web3PrivateService.getWeb3Private(CHAIN_TYPE.TRON).address;
    }

    protected get web3Public(): TronWeb3Public {
        return Injector.web3PublicService.getWeb3Public(this.blockchain);
    }

    public abstract calculate(
        from: PriceTokenAmount<TronBlockchainName>,
        to: PriceToken<TronBlockchainName>,
        options?: CalculationOptions
    ): Promise<TronInstantTrade>;
}
