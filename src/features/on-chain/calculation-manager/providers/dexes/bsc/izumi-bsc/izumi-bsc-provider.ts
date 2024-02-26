import { wrappedNativeTokensList } from 'src/common/tokens/constants/wrapped-native-tokens';
import { BLOCKCHAIN_NAME } from 'src/core/blockchain/models/blockchain-name';
import { IzumiProvider } from 'src/features/on-chain/calculation-manager/providers/dexes/common/izumi-abstract/izumi-provider';

export class IzumiBscProvider extends IzumiProvider {
    public readonly blockchain = BLOCKCHAIN_NAME.BINANCE_SMART_CHAIN;

    protected readonly dexAddress = '0xedf2021f41AbCfE2dEA4427E1B61f4d0AA5aA4b8';

    protected readonly config = {
        maxTransitTokens: 2,
        quoterAddress: '0xDCe9a4ACC59E69ECcC0cdA2E82fe601fdB726542',
        liquidityManagerAddress: '0xBF55ef05412f1528DbD96ED9E7181f87d8C9F453',
        routingTokenAddresses: [
            '0x55d398326f99059ff775485246999027b3197955', // USDT
            wrappedNativeTokensList[BLOCKCHAIN_NAME.BINANCE_SMART_CHAIN]!.address, // WBNB
            '0xe9e7cea3dedca5984780bafc599bd69add087d56' // BUSD
        ],
        multicallAddress: '0xA1189a420662105bef5Be444B8b1E0a7D8279672',
        supportedFees: [2000, 400]
    };
}
