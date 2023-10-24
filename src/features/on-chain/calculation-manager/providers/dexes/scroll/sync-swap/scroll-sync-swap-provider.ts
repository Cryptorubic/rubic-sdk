import { BLOCKCHAIN_NAME } from 'src/core/blockchain/models/blockchain-name';
import { SyncSwapAbstractProvider } from 'src/features/on-chain/calculation-manager/providers/dexes/common/sync-swap-abstract/sync-swap-abstract-provider';

export class ScrollSyncSwapProvider extends SyncSwapAbstractProvider {
    public readonly blockchain = BLOCKCHAIN_NAME.SCROLL;

    public readonly dexContractAddress = '0x80e38291e06339d10AAB483C65695D004dBD5C69';

    public readonly routerHelperContract = '0x39D2E9dBD697e135E3D111F7176dBc123D6807ca';

    public readonly vault = '0x7160570BB153Edd0Ea1775EC2b2Ac9b65F1aB61B';

    public readonly factories = [
        '0x37BAc764494c8db4e54BDE72f6965beA9fa0AC2d',
        '0xE4CF807E351b56720B17A59094179e7Ed9dD3727'
    ];

    public readonly routeTokens = [
        '0x5300000000000000000000000000000000000004', // WETH
        '0x06efdbff2a14a7c8e15944d1f4a48f9f95f663a4', // USDC
        '0xf55bec9cafdbe8730f096aa55dad6d22d44099df', // USDT
        '0xca77eb3fefe3725dc33bccb54edefc3d9f764f97', // DAI
        '0x3c1bca5a656e69edcd0d4e36bebb3fcdaca60cf1' // WBTC
    ];

    public readonly masterAddress = '0x608Cb7C3168427091F5994A45Baf12083964B4A3';

    public readonly maxTransitTokens = 1;
}
