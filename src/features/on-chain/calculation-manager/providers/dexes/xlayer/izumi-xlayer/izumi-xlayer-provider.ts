import { wrappedNativeTokensList } from 'src/common/tokens/constants/wrapped-native-tokens';
import { BLOCKCHAIN_NAME } from 'src/core/blockchain/models/blockchain-name';
import { IzumiProvider } from 'src/features/on-chain/calculation-manager/providers/dexes/common/izumi-abstract/izumi-provider';

export class IzumiXlayerProvider extends IzumiProvider {
    public readonly blockchain = BLOCKCHAIN_NAME.XLAYER;

    protected readonly dexAddress = '0xd7de110Bd452AAB96608ac3750c3730A17993DE0';

    protected readonly config = {
        maxTransitTokens: 2,
        quoterAddress: '0x93C22Fbeff4448F2fb6e432579b0638838Ff9581',
        liquidityManagerAddress: '0xF42C48f971bDaA130573039B6c940212EeAb8496',
        routingTokenAddresses: [
            '0xe538905cf8410324e03a5a23c1c177a474d59b2b', // WOKB
            wrappedNativeTokensList[BLOCKCHAIN_NAME.XLAYER]!.address, // WBNB
            '0x1e4a5963abfd975d8c9021ce480b42188849d41d' // USDT
        ],
        multicallAddress: '0x14323AfbC2b82fE58F0D9c203830EE969B4d1bE2',
        supportedFees: [10000, 3000, 500]
    };
}
