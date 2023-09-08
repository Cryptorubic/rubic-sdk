import { BLOCKCHAIN_NAME } from 'src/core/blockchain/models/blockchain-name';
import { vooiLineaPoolIdMapping } from 'src/features/on-chain/calculation-manager/providers/dexes/linea/vooi/constants/pool-id-mapping';
import { VooiAbstractProvider } from "../../common/vooi-abstract/vooi-abstract-provider";
import { VooiTradeStruct } from "../../common/vooi-abstract/models/vooi-trade-struct";
import { VooiLineaTrade } from "./vooi-trade";

export class VooiLineaProvider extends VooiAbstractProvider {
    protected readonly omniPoolAddress = '0x87E4c4517B28844f575Cfbbc4CABBD867863EA6E';
    protected readonly vooiPoolIdMapping = vooiLineaPoolIdMapping;
    public readonly blockchain = BLOCKCHAIN_NAME.LINEA;

    protected createTradeInstance(
        tradeStruct: VooiTradeStruct,
        providerAddress: string
    ): VooiLineaTrade {
        return new VooiLineaTrade(
            tradeStruct,
            providerAddress
        );
    }
}