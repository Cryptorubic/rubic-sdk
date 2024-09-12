import { wrappedNativeTokensList } from 'src/common/tokens/constants/wrapped-native-tokens';
import { BLOCKCHAIN_NAME } from 'src/core/blockchain/models/blockchain-name';

import { IzumiProvider } from '../../common/izumi-abstract/izumi-provider';

export class IzumiGravityProvider extends IzumiProvider {
    public readonly blockchain = BLOCKCHAIN_NAME.GRAVITY;

    protected readonly dexAddress = '';

    protected readonly config = {
        maxTransitTokens: 1,
        quoterAddress: '',
        liquidityManagerAddress: '',
        routingTokenAddresses: [
            wrappedNativeTokensList[BLOCKCHAIN_NAME.GRAVITY]!.address, // WG
            '0xf6f832466Cd6C21967E0D954109403f36Bc8ceaA', // WETH
            '0xFbDa5F676cB37624f28265A144A48B0d6e87d3b6' // USDC
        ],
        multicallAddress: '0x7a524c7e82874226F0b51aade60A1BE4D430Cf0F',
        supportedFees: [0.05, 0.3, 1]
    };
}
