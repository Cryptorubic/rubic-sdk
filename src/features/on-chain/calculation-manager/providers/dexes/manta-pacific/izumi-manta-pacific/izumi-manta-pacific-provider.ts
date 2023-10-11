import { wrappedNativeTokensList } from 'src/common/tokens';
import { BLOCKCHAIN_NAME } from 'src/core/blockchain/models/blockchain-name';
import { IzumiProvider } from 'src/features/on-chain/calculation-manager/providers/dexes/common/izumi-abstract/izumi-provider';

export class IzumiMantaPacificProvider extends IzumiProvider {
    public readonly blockchain = BLOCKCHAIN_NAME.MANTA_PACIFIC;

    protected readonly dexAddress = '0x3EF68D3f7664b2805D4E88381b64868a56f88bC4';

    protected readonly config = {
        maxTransitTokens: 2,
        quoterAddress: '0x34bc1b87f60e0a30c0e24FD7Abada70436c71406',
        liquidityManagerAddress: '0x19b683A2F45012318d9B2aE1280d68d3eC54D663',
        routingTokenAddresses: [
            '0xb73603C5d87fA094B7314C74ACE2e64D165016fb', // USDC
            wrappedNativeTokensList[BLOCKCHAIN_NAME.MANTA_PACIFIC]!.address, // WETH
            '0xf417F5A458eC102B90352F697D6e2Ac3A3d2851f' // USDT
        ],
        multicallAddress: '',
        supportedFees: [10000, 3000, 500]
    };
}
