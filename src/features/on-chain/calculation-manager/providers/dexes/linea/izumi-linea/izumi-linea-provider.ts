import { wrappedNativeTokensList } from 'src/common/tokens/constants/wrapped-native-tokens';
import { BLOCKCHAIN_NAME } from 'src/core/blockchain/models/blockchain-name';
import { IzumiProvider } from 'src/features/on-chain/calculation-manager/providers/dexes/common/izumi-abstract/izumi-provider';

export class IzumiLineaProvider extends IzumiProvider {
    public readonly blockchain = BLOCKCHAIN_NAME.LINEA;

    protected readonly dexAddress = '0x032b241De86a8660f1Ae0691a4760B426EA246d7';

    protected readonly config = {
        maxTransitTokens: 2,
        quoterAddress: '0xe4A0b241D8345d86FB140D40c87C5fbDd685B9dd',
        liquidityManagerAddress: '0x1CB60033F61e4fc171c963f0d2d3F63Ece24319c',
        routingTokenAddresses: [
            '0x176211869ca2b568f2a7d4ee941e073a821ee1ff', // USDC
            wrappedNativeTokensList[BLOCKCHAIN_NAME.LINEA]!.address, // WETH
            '0x7d43aabc515c356145049227cee54b608342c0ad', // BUSD
            '0x0a3bb08b3a15a19b4de82f8acfc862606fb69a2d' // iUSD
        ],
        multicallAddress: '0x7a524c7e82874226F0b51aade60A1BE4D430Cf0F',
        supportedFees: [10000, 3000, 500]
    };
}
