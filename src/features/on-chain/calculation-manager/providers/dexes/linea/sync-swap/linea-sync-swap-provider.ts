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
        '0x176211869cA2b568f2A7D4EE941E073a821EE1ff', // USDC
        '0x7d43aabc515c356145049227cee54b608342c0ad', // ceBUSD
        '0xf5c6825015280cdfd0b56903f9f8b5a2233476f5', // ceBNB
        '0x3aab2285ddcddad8edf438c1bab47e1a9d05a9b4', // WBTC
        '0x5471ea8f739dd37e9b81be9c5c77754d8aa953e4', // ceAVAX
        '0x265b25e22bcd7f10a5bd6e6410f10537cc7567e8' // ceMATIC
    ];

    public readonly masterAddress = '0x608Cb7C3168427091F5994A45Baf12083964B4A3';

    public readonly maxTransitTokens = 1;
}
