import { BLOCKCHAIN_NAME } from 'src/core/blockchain/models/blockchain-name';

import { VooiTradeStruct } from '../../common/vooi-abstract/models/vooi-trade-struct';
import { VooiAbstractProvider } from '../../common/vooi-abstract/vooi-abstract-provider';
import { vooiTaikoPoolIdMapping } from './constants/pool-id-mapping';
import { VooiTaikoTrade } from './vooi-trade';

export class VooiTaikoProvider extends VooiAbstractProvider {
    protected readonly omniPoolAddress = '0xf3BDe7E88Ea5d85c2ee514be416fab4b2Bf9d8E5';

    protected readonly vooiPoolIdMapping = vooiTaikoPoolIdMapping;

    public readonly blockchain = BLOCKCHAIN_NAME.TAIKO;

    protected createTradeInstance(
        tradeStruct: VooiTradeStruct,
        providerAddress: string
    ): VooiTaikoTrade {
        return new VooiTaikoTrade(tradeStruct, providerAddress);
    }
}
