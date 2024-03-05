import { wrappedNativeTokensList } from 'src/common/tokens/constants/wrapped-native-tokens';
import { BLOCKCHAIN_NAME } from 'src/core/blockchain/models/blockchain-name';
import { IzumiProvider } from 'src/features/on-chain/calculation-manager/providers/dexes/common/izumi-abstract/izumi-provider';

export class IzumiBlastProvider extends IzumiProvider {
    public readonly blockchain = BLOCKCHAIN_NAME.BLAST;

    protected readonly dexAddress = '0xA3F50FeBA40dd3E884688C0AF72C4054D07a1c50';

    protected readonly config = {
        maxTransitTokens: 2,
        quoterAddress: '0xd413b415Bf8449D6DB8238826579647bfDb60a9f',
        liquidityManagerAddress: '0x5e7902aDf0Ea0ff827683Cc1d431F740CAD0731b',
        routingTokenAddresses: [
            wrappedNativeTokensList[BLOCKCHAIN_NAME.BLAST]!.address, // WETH
            '0x4300000000000000000000000000000000000003', // USDB
            '0x0A3BB08b3a15A19b4De82F8AcFc862606FB69A2D' // iUSD
        ],
        multicallAddress: '0x1DADF066518E2b7064D85cED45625BFeC52ca07d',
        supportedFees: [500, 3000, 10_000]
    };
}
