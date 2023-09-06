import { BLOCKCHAIN_NAME } from 'src/core/blockchain/models/blockchain-name';
import { XyDexAbstractProvider } from 'src/features/on-chain/calculation-manager/providers/dexes/common/xy-dex-abstract/xy-dex-abstract-provider';

export class XyDexZksyncProvider extends XyDexAbstractProvider {
    public readonly blockchain = BLOCKCHAIN_NAME.ZK_SYNC;
}
