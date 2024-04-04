import { wrappedNativeTokensList } from 'src/common/tokens/constants/wrapped-native-tokens';
import { BLOCKCHAIN_NAME } from 'src/core/blockchain/models/blockchain-name';
import { IzumiProvider } from 'src/features/on-chain/calculation-manager/providers/dexes/common/izumi-abstract/izumi-provider';

export class IzumiZkfairProvider extends IzumiProvider {
    public readonly blockchain = BLOCKCHAIN_NAME.ZK_FAIR;

    protected readonly dexAddress = '0x02F55D53DcE23B4AA962CC68b0f685f26143Bdb2';

    protected readonly config = {
        maxTransitTokens: 2,
        quoterAddress: '0x3EF68D3f7664b2805D4E88381b64868a56f88bC4',
        liquidityManagerAddress: '0x110dE362cc436D7f54210f96b8C7652C2617887D',
        routingTokenAddresses: [
            wrappedNativeTokensList[BLOCKCHAIN_NAME.ZK_FAIR]!.address, // WRAP
            '0x1cD3E2A23C45A690a18Ed93FD1412543f464158F', // ZKF
            '0x450C29E6E799efECc6811954F47756af602D7930' // FAIR
        ],
        multicallAddress: '0x7a524c7e82874226F0b51aade60A1BE4D430Cf0F',
        supportedFees: [10000, 3000, 500]
    };
}
