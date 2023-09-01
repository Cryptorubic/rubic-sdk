import { BLOCKCHAIN_NAME } from 'src/core/blockchain/models/blockchain-name';
import { XyDexAbstractProvider } from 'src/features/on-chain/calculation-manager/providers/dexes/common/xy-dex-abstract/xy-dex-abstract-provider';

export class XyDexAstarProvider extends XyDexAbstractProvider {
    public readonly blockchain = BLOCKCHAIN_NAME.ASTAR_EVM;
}
