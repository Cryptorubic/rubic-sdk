import { PriceToken, PriceTokenAmount } from 'src/common/tokens';
import { BLOCKCHAIN_NAME, TronBlockchainName } from 'src/core/blockchain/models/blockchain-name';
import { CHAIN_TYPE } from 'src/core/blockchain/models/chain-type';
import { TronWeb3Public } from 'src/core/blockchain/web3-public-service/web3-public/tron-web3-public/tron-web3-public';
import { Injector } from 'src/core/injector/injector';
import { OnChainCalculationOptions } from 'src/features/on-chain/calculation-manager/providers/common/models/on-chain-calculation-options';
import { TronOnChainTrade } from 'src/features/on-chain/calculation-manager/providers/common/on-chain-trade/tron-on-chain-trade/tron-on-chain-trade';
import { OnChainProvider } from 'src/features/on-chain/calculation-manager/providers/dexes/common/on-chain-provider/on-chain-provider';

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
