import { wrappedNativeTokensList } from 'src/common/tokens/constants/wrapped-native-tokens';
import { BLOCKCHAIN_NAME } from 'src/core/blockchain/models/blockchain-name';
import { IzumiProvider } from 'src/features/on-chain/calculation-manager/providers/dexes/common/izumi-abstract/izumi-provider';

export class IzumiZkLinkProvider extends IzumiProvider {
    public readonly blockchain = BLOCKCHAIN_NAME.ZK_LINK;

    protected readonly dexAddress = '0x377EC7c9ae5a0787F384668788a1654249059dD6';

    protected readonly config = {
        maxTransitTokens: 2,
        quoterAddress: '0x7dEe7de9814ed6C1e20B3E4E2fA9b1B96E15FDe1',
        liquidityManagerAddress: '0x936c9A1B8f88BFDbd5066ad08e5d773BC82EB15F',
        routingTokenAddresses: [
            wrappedNativeTokensList[BLOCKCHAIN_NAME.ZK_LINK]!.address, // WRAP
            '0x1a1A3b2ff016332e866787B311fcB63928464509', // USDC
            '0x2F8A25ac62179B31D62D7F80884AE57464699059' // USDT
        ],
        multicallAddress: 'fd5f0acaaa666f3d816fe3dd54a96dacd6e7bb16',
        supportedFees: [10000, 3000, 500]
    };
}
