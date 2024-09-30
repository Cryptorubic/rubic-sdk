import { wrappedNativeTokensList } from 'src/common/tokens/constants/wrapped-native-tokens';
import { BLOCKCHAIN_NAME } from 'src/core/blockchain/models/blockchain-name';

import { IzumiProvider } from '../../common/izumi-abstract/izumi-provider';

export class IzumiGravityProvider extends IzumiProvider {
    public readonly blockchain = BLOCKCHAIN_NAME.GRAVITY;

    protected readonly dexAddress = '0x3EF68D3f7664b2805D4E88381b64868a56f88bC4';

    protected readonly config = {
        maxTransitTokens: 2,
        quoterAddress: '0x33531bDBFE34fa6Fd5963D0423f7699775AacaaF',
        liquidityManagerAddress: '0x19b683A2F45012318d9B2aE1280d68d3eC54D663',
        routingTokenAddresses: [
            wrappedNativeTokensList[BLOCKCHAIN_NAME.GRAVITY]!.address, // WG
            '0xf6f832466Cd6C21967E0D954109403f36Bc8ceaA', // WETH
            '0xFbDa5F676cB37624f28265A144A48B0d6e87d3b6' // USDC
        ],
        multicallAddress: '0x7a524c7e82874226F0b51aade60A1BE4D430Cf0F',
        supportedFees: [10000, 3000, 500],
        tokenBlackList: [
            {
                direction: 'from',
                tokenAddress: '0xFbDa5F676cB37624f28265A144A48B0d6e87d3b6'
            }
        ]
    };
}
