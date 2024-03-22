import { BLOCKCHAIN_NAME, EvmBlockchainName } from 'src/core/blockchain/models/blockchain-name';

import { XyDexAbstractProvider } from '../../common/xy-dex-abstract/xy-dex-abstract-provider';

export class XyDexBlastProvider extends XyDexAbstractProvider {
    public blockchain: EvmBlockchainName = BLOCKCHAIN_NAME.BLAST;
}
