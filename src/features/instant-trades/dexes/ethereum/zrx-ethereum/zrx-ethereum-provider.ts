import { BLOCKCHAIN_NAME } from '@rsdk-core/blockchain/models/blockchain-name';
import { ZrxAbstractProvider } from '@rsdk-features/instant-trades/dexes/common/zrx-common/zrx-abstract-provider';

export class ZrxEthereumProvider extends ZrxAbstractProvider {
    public readonly blockchain = BLOCKCHAIN_NAME.ETHEREUM;
}
