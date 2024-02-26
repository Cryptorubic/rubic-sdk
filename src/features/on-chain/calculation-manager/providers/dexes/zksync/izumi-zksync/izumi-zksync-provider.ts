import { wrappedNativeTokensList } from 'src/common/tokens/constants/wrapped-native-tokens';
import { BLOCKCHAIN_NAME } from 'src/core/blockchain/models/blockchain-name';
import { IzumiProvider } from 'src/features/on-chain/calculation-manager/providers/dexes/common/izumi-abstract/izumi-provider';

export class IzumiZksyncProvider extends IzumiProvider {
    public readonly blockchain = BLOCKCHAIN_NAME.ZK_SYNC;

    protected readonly dexAddress = '0x943ac2310D9BC703d6AB5e5e76876e212100f894';

    protected readonly config = {
        maxTransitTokens: 2,
        quoterAddress: '0x1a447a8Ec35B8120549C6567fC6FCC0768b318C2',
        liquidityManagerAddress: '0x483FDE31bcE3DCc168E23a870831b50Ce2cCd1F1',
        routingTokenAddresses: [
            '0x3355df6d4c9c3035724fd0e3914de96a5a83aaf4', // USDC
            wrappedNativeTokensList[BLOCKCHAIN_NAME.ZK_SYNC]!.address, // WRAP
            '0x2039bb4116b4efc145ec4f0e2ea75012d6c0f181', // BUSD,
            '0x496d88d1efc3e145b7c12d53b78ce5e7eda7a42c' // SL USDT
        ],
        multicallAddress: '0x18d6b2F2A5F88380D42AdD6588F4484Cfb27EE07',
        supportedFees: [10000, 3000, 2000, 400]
    };
}
