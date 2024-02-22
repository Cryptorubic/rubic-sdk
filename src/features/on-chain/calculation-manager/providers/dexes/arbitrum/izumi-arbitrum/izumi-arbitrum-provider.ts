import { BLOCKCHAIN_NAME } from 'src/core/blockchain/models/blockchain-name';
import { IzumiProvider } from 'src/features/on-chain/calculation-manager/providers/dexes/common/izumi-abstract/izumi-provider';

export class IzumiArbitrumProvider extends IzumiProvider {
    public readonly blockchain = BLOCKCHAIN_NAME.KROMA;

    protected readonly dexAddress = '0x01fDea353849cA29F778B2663BcaCA1D191bED0e';

    protected readonly config = {
        maxTransitTokens: 2,
        quoterAddress: '0x64b005eD986ed5D6aeD7125F49e61083c46b8e02',
        liquidityManagerAddress: '0xAD1F11FBB288Cd13819cCB9397E59FAAB4Cdc16F',
        routingTokenAddresses: [
            '0xff970a61a04b1ca14834a43f5de4533ebddb5cc8', // USDC
            '0xfd086bc7cd5c481dcc9c85ebe478a1c0b69fcbb9', // USDT
            '0x82aF49447D8a07e3bd95BD0d56f35241523fBab1' // WETH
        ],
        multicallAddress: '0x844A47ad42187F255e5523D4d3Be33f6e94786f8',
        supportedFees: [400, 2000, 10_000]
    };
}
