import { wrappedNativeTokensList } from 'src/common/tokens';
import { BLOCKCHAIN_NAME } from 'src/core/blockchain/models/blockchain-name';
import { IzumiProvider } from 'src/features/on-chain/calculation-manager/providers/dexes/common/izumi-abstract/izumi-provider';

export class IzumiMeterProvider extends IzumiProvider {
    public readonly blockchain = BLOCKCHAIN_NAME.METER;

    protected readonly dexAddress = '0x90bd53037B504fB83687Ea153F9657D3BD989976';

    protected readonly config = {
        maxTransitTokens: 2,
        quoterAddress: '0x85a3871CA57637860b5d35E983341c92aE07Ed5C',
        liquidityManagerAddress: '0x579ffe4A5c8CB2C969aE4E65039B7dBb6951d164',
        routingTokenAddresses: [
            '0x5fa41671c48e3c951afc30816947126ccc8c162e', // wUSDT.eth
            wrappedNativeTokensList[BLOCKCHAIN_NAME.METER]!.address, // WMTR
            '0x24aa189dfaa76c671c279262f94434770f557c35', // wBUSD.bsc
            '0x55137322647150d4ff0de22967589690c57a24d3', // IZI
            '0x46b40202da16761633e757674661683fd733b845' // iUSD
        ],
        multicallAddress: '',
        supportedFees: [10000, 3000, 500]
    };
}
