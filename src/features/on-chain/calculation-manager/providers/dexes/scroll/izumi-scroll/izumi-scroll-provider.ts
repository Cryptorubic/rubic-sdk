import { wrappedNativeTokensList } from 'src/common/tokens/constants/wrapped-native-tokens';
import { BLOCKCHAIN_NAME } from 'src/core/blockchain/models/blockchain-name';
import { IzumiProvider } from 'src/features/on-chain/calculation-manager/providers/dexes/common/izumi-abstract/izumi-provider';

export class IzumiScrollProvider extends IzumiProvider {
    public readonly blockchain = BLOCKCHAIN_NAME.SCROLL;

    protected readonly dexAddress = '0x2db0AFD0045F3518c77eC6591a542e326Befd3D7';

    protected readonly config = {
        maxTransitTokens: 2,
        quoterAddress: '0x33531bDBFE34fa6Fd5963D0423f7699775AacaaF',
        liquidityManagerAddress: '0x1502d025BfA624469892289D45C0352997251728',
        routingTokenAddresses: [
            '0xf55bec9cafdbe8730f096aa55dad6d22d44099df', // USDT
            wrappedNativeTokensList[BLOCKCHAIN_NAME.SCROLL]!.address,
            '0x06efdbff2a14a7c8e15944d1f4a48f9f95f663a4' // USDC
        ],
        multicallAddress: '0x93E94ef7D2d735fF21C302c765d8A77C1955A311',
        supportedFees: [10000, 3000, 500]
    };
}
