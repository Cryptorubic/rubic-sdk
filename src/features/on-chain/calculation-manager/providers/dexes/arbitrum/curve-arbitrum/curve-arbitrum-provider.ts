import { BLOCKCHAIN_NAME } from 'src/core/blockchain/models/blockchain-name';
import { CurveArbitrumTrade } from 'src/features/on-chain/calculation-manager/providers/dexes/arbitrum/curve-arbitrum/curve-arbitrum-trade';
import { CurveAbstractProvider } from 'src/features/on-chain/calculation-manager/providers/dexes/common/curve-provider/curve-abstract-provider';

export class CurveArbitrumProvider extends CurveAbstractProvider<CurveArbitrumTrade> {
    public readonly blockchain = BLOCKCHAIN_NAME.ARBITRUM;

    public readonly Trade = CurveArbitrumTrade;
}
