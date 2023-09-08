import { BLOCKCHAIN_NAME } from 'src/core/blockchain/models/blockchain-name';
import { SyncSwapAbstractProvider } from 'src/features/on-chain/calculation-manager/providers/dexes/common/sync-swap-abstract/sync-swap-abstract-provider';

export class LineaSyncSwapProvider extends SyncSwapAbstractProvider {
    public readonly blockchain = BLOCKCHAIN_NAME.LINEA;

    public readonly dexContractAddress = '0x80e38291e06339d10AAB483C65695D004dBD5C69';

    public readonly routerHelperContract = '0x91e3D3E51dC93B80a2FFBfdCa29EbF33e132D4E6';

    public readonly vault = '0x7160570BB153Edd0Ea1775EC2b2Ac9b65F1aB61B';

    public readonly factories = [
        '0x37BAc764494c8db4e54BDE72f6965beA9fa0AC2d',
        '0xE4CF807E351b56720B17A59094179e7Ed9dD3727'
    ];

    public readonly routeTokens = [
        '0xe5d7c2a44ffddf6b295a15c148167daaaf5cf34f', // WETH
        '0x176211869cA2b568f2A7D4EE941E073a821EE1ff' // USDC
    ];

    public readonly masterAddress = '0x608Cb7C3168427091F5994A45Baf12083964B4A3';
}
