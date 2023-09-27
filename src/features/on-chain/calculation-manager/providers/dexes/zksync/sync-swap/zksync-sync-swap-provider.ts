import { BLOCKCHAIN_NAME } from 'src/core/blockchain/models/blockchain-name';
import { SyncSwapAbstractProvider } from 'src/features/on-chain/calculation-manager/providers/dexes/common/sync-swap-abstract/sync-swap-abstract-provider';

export class ZkSyncSyncSwapProvider extends SyncSwapAbstractProvider {
    public readonly blockchain = BLOCKCHAIN_NAME.ZK_SYNC;

    public readonly dexContractAddress = '0x2da10A1e27bF85cEdD8FFb1AbBe97e53391C0295';

    public readonly routerHelperContract = '0x5c07e74cb541c3d1875aeee441d691ded6eba204';

    public readonly vault = '0x621425a1Ef6abE91058E9712575dcc4258F8d091';

    public readonly factories = [
        '0xf2dad89f2788a8cd54625c60b55cd3d2d0aca7cb',
        '0x5b9f21d407f35b10cbfddca17d5d84b129356ea3'
    ];

    public readonly routeTokens = [
        '0x5aea5775959fbc2557cc8789bc1bf90a239d9a91', // WETH
        '0x3355df6D4c9C3035724Fd0e3914dE96A5a83aaf4' // USDC
    ];

    public readonly masterAddress = '0xbb05918e9b4ba9fe2c8384d223f0844867909ffb';

    public readonly maxTransitTokens = 1;
}
