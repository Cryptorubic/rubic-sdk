import { BLOCKCHAIN_NAME } from 'src/core/blockchain/models/blockchain-name';

import { ALGB_TOKEN } from './algb-token-addresses';

export const layerZeroProxyOFT = {
    [BLOCKCHAIN_NAME.ARBITRUM]: ALGB_TOKEN.ARBITRUM,
    [BLOCKCHAIN_NAME.BINANCE_SMART_CHAIN]: ALGB_TOKEN.BSC,
    [BLOCKCHAIN_NAME.POLYGON]: '0xDef87c507ef911Fd99c118c53171510Eb7967738'
};
