import { BLOCKCHAIN_NAME } from 'src/core/blockchain/models/blockchain-name';
import { IzumiProvider } from 'src/features/on-chain/calculation-manager/providers/dexes/common/izumi-abstract/izumi-provider';
import { IzumiQuoterController } from 'src/features/on-chain/calculation-manager/providers/dexes/common/izumi-abstract/izumi-quoter-controller';

export class IzumiBscProvider extends IzumiProvider {
    public readonly blockchain = BLOCKCHAIN_NAME.BINANCE_SMART_CHAIN;

    protected readonly dexAddress = '0xedf2021f41AbCfE2dEA4427E1B61f4d0AA5aA4b8';

    protected readonly quoterAddress = '0x64b005eD986ed5D6aeD7125F49e61083c46b8e02';

    protected readonly izumiConfig = {
        maxTransitTokens: 2,
        routingTokenAddresses: [
            '0x55d398326f99059ff775485246999027b3197955', // USDT
            '0xbb4cdb9cbd36b01bd1cbaebf2de08d9173bc095c', // WBNB
            '0xe9e7cea3dedca5984780bafc599bd69add087d56' // BUSD
            // '0x37a56cdcd83dce2868f721de58cb3830c44c6303' // ZBC
        ]
    };

    protected readonly quoterController = new IzumiQuoterController(
        this.quoterAddress,
        this.blockchain,
        this.izumiConfig
    );
}
