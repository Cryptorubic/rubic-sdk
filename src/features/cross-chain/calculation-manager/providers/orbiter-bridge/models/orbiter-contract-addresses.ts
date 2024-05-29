import { BLOCKCHAIN_NAME } from 'src/core/blockchain/models/blockchain-name';

import { OrbiterSupportedBlockchain } from './orbiter-supported-blockchains';

export const orbiterContractAddresses: Record<OrbiterSupportedBlockchain, string> = {
    [BLOCKCHAIN_NAME.ETHEREUM]: '0xc741900276cd598060b0fe6594fbe977392928f4',
    [BLOCKCHAIN_NAME.ARBITRUM]: '0x6a065083886ec63d274b8e1fe19ae2ddf498bfdd',
    [BLOCKCHAIN_NAME.ZK_SYNC]: '0xb4ab2ff34fadc774aff45f1c4566cb5e16bd4867',
    [BLOCKCHAIN_NAME.POLYGON]: '0x653f25dc641544675338cb47057f8ea530c69b78',
    [BLOCKCHAIN_NAME.OPTIMISM]: '0x3191f40de6991b1bb1f61b7cec43d62bb337786b',
    [BLOCKCHAIN_NAME.ZETACHAIN]: '0x13E46b2a3f8512eD4682a8Fb8B560589fE3C2172',
    [BLOCKCHAIN_NAME.BINANCE_SMART_CHAIN]: '0x13e46b2a3f8512ed4682a8fb8b560589fe3c2172',
    [BLOCKCHAIN_NAME.POLYGON_ZKEVM]: '0x13e46b2a3f8512ed4682a8fb8b560589fe3c2172',
    [BLOCKCHAIN_NAME.LINEA]: '0x13e46b2a3f8512ed4682a8fb8b560589fe3c2172',
    [BLOCKCHAIN_NAME.MANTLE]: '0x13e46b2a3f8512ed4682a8fb8b560589fe3c2172',
    [BLOCKCHAIN_NAME.BASE]: '0x13e46b2a3f8512ed4682a8fb8b560589fe3c2172',
    [BLOCKCHAIN_NAME.MANTA_PACIFIC]: '0x13e46b2a3f8512ed4682a8fb8b560589fe3c2172',
    [BLOCKCHAIN_NAME.SCROLL]: '0x13e46b2a3f8512ed4682a8fb8b560589fe3c2172',
    [BLOCKCHAIN_NAME.BLAST]: '0x13E46b2a3f8512eD4682a8Fb8B560589fE3C2172',
    [BLOCKCHAIN_NAME.KROMA]: '0x13E46b2a3f8512eD4682a8Fb8B560589fE3C2172',
    [BLOCKCHAIN_NAME.STARKNET]:
        '0x0173f81c529191726c6e7287e24626fe24760ac44dae2a1f7e02080230f8458b',
    [BLOCKCHAIN_NAME.MODE]: '0x13E46b2a3f8512eD4682a8Fb8B560589fE3C2172',
    [BLOCKCHAIN_NAME.ZK_FAIR]: '0x13e46b2a3f8512ed4682a8fb8b560589fe3c2172',
    [BLOCKCHAIN_NAME.XLAYER]: '0x13e46b2a3f8512ed4682a8fb8b560589fe3c2172',
    [BLOCKCHAIN_NAME.TAIKO]: '0x2598d7bc9d3b4b6124f3282e49eee68db270f516',
    [BLOCKCHAIN_NAME.ZK_LINK]: '0xb4ab2ff34fadc774aff45f1c4566cb5e16bd4867',
    [BLOCKCHAIN_NAME.MERLIN]: '0x4b8a4641c140b3aa6be8d99786fafe47a65869db'
};
