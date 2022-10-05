import { OneinchAbstractProvider } from 'src/features/on-chain/providers/dexes/abstract/oneinch-abstract/oneinch-abstract-provider';
import { BLOCKCHAIN_NAME } from 'src/core/blockchain/models/blockchain-name';

export class OneinchAuroraProvider extends OneinchAbstractProvider {
    public readonly blockchain = BLOCKCHAIN_NAME.AURORA;
}
