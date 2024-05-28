import { wrappedNativeTokensList } from 'src/common/tokens/constants/wrapped-native-tokens';
import { BLOCKCHAIN_NAME } from 'src/core/blockchain/models/blockchain-name';
import { IzumiProvider } from 'src/features/on-chain/calculation-manager/providers/dexes/common/izumi-abstract/izumi-provider';

export class IzumiTaikoProvider extends IzumiProvider {
    public readonly blockchain = BLOCKCHAIN_NAME.TAIKO;

    protected readonly dexAddress = '0x04830cfCED9772b8ACbAF76Cfc7A630Ad82c9148';

    protected readonly config = {
        maxTransitTokens: 1,
        quoterAddress: '0x14323AfbC2b82fE58F0D9c203830EE969B4d1bE2',
        liquidityManagerAddress: '0x33531bDBFE34fa6Fd5963D0423f7699775AacaaF',
        routingTokenAddresses: [
            wrappedNativeTokensList[BLOCKCHAIN_NAME.TAIKO]!.address, // WETH
            '0x07d83526730c7438048D55A4fc0b850e2aaB6f0b' // USDC
        ],
        multicallAddress: '0x7a524c7e82874226F0b51aade60A1BE4D430Cf0F',
        supportedFees: [10000, 3000, 500]
    };
}
