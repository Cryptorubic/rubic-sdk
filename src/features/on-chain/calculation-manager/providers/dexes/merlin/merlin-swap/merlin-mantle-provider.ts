import { wrappedNativeTokensList } from 'src/common/tokens/constants/wrapped-native-tokens';
import { BLOCKCHAIN_NAME } from 'src/core/blockchain/models/blockchain-name';
import {
    ON_CHAIN_TRADE_TYPE,
    OnChainTradeType
} from 'src/features/on-chain/calculation-manager/providers/common/models/on-chain-trade-type';
import { IzumiProvider } from 'src/features/on-chain/calculation-manager/providers/dexes/common/izumi-abstract/izumi-provider';

export class MerlinSwapMerlinProvider extends IzumiProvider {
    public readonly blockchain = BLOCKCHAIN_NAME.MERLIN;

    protected readonly dexAddress = '0x1aFa5D7f89743219576Ef48a9826261bE6378a68';

    public get type(): OnChainTradeType {
        return ON_CHAIN_TRADE_TYPE.MERLIN_SWAP;
    }

    protected readonly config = {
        maxTransitTokens: 2,
        quoterAddress: '0xD5f164e44057e8004266cc2EABc670cDFa3E0Fd2',
        liquidityManagerAddress: '0x261507940678Bf22d8ee96c31dF4a642294c0467',
        routingTokenAddresses: [
            wrappedNativeTokensList[BLOCKCHAIN_NAME.MERLIN]!.address, // WBTC
            '0x480e158395cc5b41e5584347c495584ca2caf78d', // VOYA
            '0x7a677e59dc2c8a42d6af3a62748c5595034a008b', // HUHU
            '0x0a3bb08b3a15a19b4de82f8acfc862606fb69a2d', // iUSD
            '0xb880fd278198bd590252621d4cd071b1842e9bcd', // M-BTC
            '0x62e99191071fc1c5947cf1e21aa95708dcc51adb' // Owl
        ],
        multicallAddress: '0x7a524c7e82874226F0b51aade60A1BE4D430Cf0F',
        supportedFees: [10000, 3000, 500]
    };
}
