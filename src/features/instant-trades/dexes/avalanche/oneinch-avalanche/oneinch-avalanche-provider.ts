import { OneinchAbstractProvider } from '@rsdk-features/instant-trades/dexes/common/oneinch-common/oneinch-abstract-provider';
import { BLOCKCHAIN_NAME } from '@rsdk-core/blockchain/models/blockchain-name';

export class OneinchAvalancheProvider extends OneinchAbstractProvider {
    public readonly blockchain = BLOCKCHAIN_NAME.AVALANCHE;
}
