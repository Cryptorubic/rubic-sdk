import { Web3Private } from '@core/blockchain/web3-private/web3-private';
import { Web3PrivateFactory } from '@core/blockchain/web3-private/web3-private-factory';
import { Configuration } from '@core/sdk/models/configuration';
import { CrossChain } from '@features/crosschain/cross-chain';
import { InstantTrades } from '@features/swap/instant-trades';

export class SDK {
    public readonly instantTrades: InstantTrades;

    public readonly crossChain: CrossChain;

    public static async createSDK(configuration: Configuration): Promise<SDK> {
        await Promise.resolve(); // setup web3 with configuration
        // Injector.createInjector(...)
        return new SDK();
    }

    private static async createWeb3Private(configuration: Configuration): Web3Private {
        Web3PrivateFactory.buildWeb3Private()
    }

    private constructor() {
        this.instantTrades = new InstantTrades();
        this.crossChain = new CrossChain();
    }
}
