import { wrappedNativeTokensList } from 'src/common/tokens/constants/wrapped-native-tokens';
import { BLOCKCHAIN_NAME } from 'src/core/blockchain/models/blockchain-name';
import { IzumiProvider } from 'src/features/on-chain/calculation-manager/providers/dexes/common/izumi-abstract/izumi-provider';

export class IzumiModeProvider extends IzumiProvider {
    public readonly blockchain = BLOCKCHAIN_NAME.MODE;

    protected readonly dexAddress = '0x3EF68D3f7664b2805D4E88381b64868a56f88bC4';

    protected readonly config = {
        maxTransitTokens: 2,
        quoterAddress: '0x34bc1b87f60e0a30c0e24FD7Abada70436c71406',
        liquidityManagerAddress: '0x19b683A2F45012318d9B2aE1280d68d3eC54D663',
        routingTokenAddresses: [
            '0xd988097fb8612cc24eec14542bc03424c656005f', // USDC
            wrappedNativeTokensList[BLOCKCHAIN_NAME.MODE]!.address, // WETH
            '0xf0f161fda2712db8b566946122a5af183995e2ed' // USDT
        ],
        multicallAddress: '0x7a524c7e82874226F0b51aade60A1BE4D430Cf0F',
        supportedFees: [10000, 3000, 500]
    };
}
