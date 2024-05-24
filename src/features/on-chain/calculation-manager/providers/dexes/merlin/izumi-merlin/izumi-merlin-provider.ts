import { wrappedNativeTokensList } from 'src/common/tokens/constants/wrapped-native-tokens';
import { BLOCKCHAIN_NAME } from 'src/core/blockchain/models/blockchain-name';
import { IzumiProvider } from 'src/features/on-chain/calculation-manager/providers/dexes/common/izumi-abstract/izumi-provider';

export class IzumiMerlinProvider extends IzumiProvider {
    public readonly blockchain = BLOCKCHAIN_NAME.MERLIN;

    protected readonly dexAddress = '0x1aFa5D7f89743219576Ef48a9826261bE6378a68';

    protected readonly config = {
        maxTransitTokens: 2,
        quoterAddress: '0xD5f164e44057e8004266cc2EABc670cDFa3E0Fd2',
        liquidityManagerAddress: '0x261507940678Bf22d8ee96c31dF4a642294c0467',
        routingTokenAddresses: [
            '0xb880fd278198bd590252621d4cd071b1842e9bcd', // MBTC
            wrappedNativeTokensList[BLOCKCHAIN_NAME.MERLIN]!.address
        ],
        multicallAddress: '0x7a524c7e82874226F0b51aade60A1BE4D430Cf0F',
        supportedFees: [10000, 3000]
    };
}
