import { wrappedNativeTokensList } from 'src/common/tokens/constants/wrapped-native-tokens';
import { BLOCKCHAIN_NAME } from 'src/core/blockchain/models/blockchain-name';
import { IzumiProvider } from 'src/features/on-chain/calculation-manager/providers/dexes/common/izumi-abstract/izumi-provider';

export class IzumiMantleProvider extends IzumiProvider {
    public readonly blockchain = BLOCKCHAIN_NAME.MANTLE;

    protected readonly dexAddress = '0x25C030116Feb2E7BbA054b9de0915E5F51b03e31';

    protected readonly config = {
        maxTransitTokens: 2,
        quoterAddress: '0xe6805638db944eA605e774e72c6F0D15Fb6a1347',
        liquidityManagerAddress: '0x611575eE1fbd4F7915D0eABCC518eD396fF78F0c',
        routingTokenAddresses: [
            '0x201eba5cc46d216ce6dc03f6a759e8e766e956ae', // USDT
            wrappedNativeTokensList[BLOCKCHAIN_NAME.MANTLE]!.address, // WBNB
            '0xdeaddeaddeaddeaddeaddeaddeaddeaddead1111', // WETH
            '0x09bc4e0d864854c6afb6eb9a9cdf58ac190d0df9', // USDC
            '0x60d01ec2d5e98ac51c8b4cf84dfcce98d527c747', // IZI
            '0x0a3bb08b3a15a19b4de82f8acfc862606fb69a2d' // iUSD
        ],
        multicallAddress: '0x1DADF066518E2b7064D85cED45625BFeC52ca07d',
        supportedFees: [10000, 3000, 500]
    };
}
