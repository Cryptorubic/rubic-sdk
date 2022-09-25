import { OneinchAbstractProvider } from 'src/features/instant-trades/providers/dexes/abstract/oneinch-abstract/oneinch-abstract-provider';
import { BLOCKCHAIN_NAME } from 'src/core/blockchain/models/blockchain-name';

export class OneinchAvalancheProvider extends OneinchAbstractProvider {
    public readonly blockchain = BLOCKCHAIN_NAME.AVALANCHE;
}
