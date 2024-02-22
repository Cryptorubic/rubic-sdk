import { BLOCKCHAIN_NAME } from 'src/core/blockchain/models/blockchain-name';
import { IzumiProvider } from 'src/features/on-chain/calculation-manager/providers/dexes/common/izumi-abstract/izumi-provider';

export class IzumiKromaProvider extends IzumiProvider {
    public readonly blockchain = BLOCKCHAIN_NAME.KROMA;

    protected readonly dexAddress = '0x02F55D53DcE23B4AA962CC68b0f685f26143Bdb2';

    protected readonly config = {
        maxTransitTokens: 2,
        quoterAddress: '0x3EF68D3f7664b2805D4E88381b64868a56f88bC4',
        liquidityManagerAddress: '0x110dE362cc436D7f54210f96b8C7652C2617887D',
        routingTokenAddresses: [
            '0x0257e4d92C00C9EfcCa1d641b224d7d09cfa4522', // USDC
            '0x0Cf7c2A584988871b654Bd79f96899e4cd6C41C0', // USDT
            '0x4200000000000000000000000000000000000001' // WETH
        ],
        multicallAddress: '0x7a524c7e82874226F0b51aade60A1BE4D430Cf0F',
        supportedFees: [500, 3000, 10_000]
    };
}
