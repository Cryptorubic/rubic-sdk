import { OnChainProvider } from 'src/features/on-chain/providers/dexes/abstract/on-chain-provider/on-chain-provider';
import { BLOCKCHAIN_NAME, TronBlockchainName } from 'src/core/blockchain/models/blockchain-name';
import { Injector } from 'src/core/injector/injector';
import { CHAIN_TYPE } from 'src/core/blockchain/models/chain-type';
import { PriceToken, PriceTokenAmount } from 'src/common/tokens';
import { OnChainCalculationOptions } from 'src/features/on-chain/providers/models/on-chain-calculation-options';
import { TronWeb3Public } from 'src/core/blockchain/web3-public-service/web3-public/tron-web3-public/tron-web3-public';
import { TronOnChainTrade } from 'src/features/on-chain/providers/abstract/on-chain-trade/tron-on-chain-trade/tron-on-chain-trade';

export abstract class TronOnChainProvider extends OnChainProvider {
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
        options?: OnChainCalculationOptions
    ): Promise<TronOnChainTrade>;
}
