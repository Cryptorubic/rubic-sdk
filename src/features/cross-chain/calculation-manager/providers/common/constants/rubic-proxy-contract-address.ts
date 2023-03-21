import { BLOCKCHAIN_NAME, BlockchainName } from 'src/core/blockchain/models/blockchain-name';

export const rubicProxyContractAddress: Record<
    BlockchainName,
    {
        gateway: string;
        router: string;
    }
> = Object.values(BLOCKCHAIN_NAME).reduce(
    (acc, blockchain) => {
        const gateway = '0x0906003a194543023Fc42ca60f9a83eB15c06f81';
        let router = '0x7F16a4BcF533C1B5e2E8C89e61468eC0863Cc524';

        if (blockchain === BLOCKCHAIN_NAME.BINANCE_SMART_CHAIN) {
            router = '0x5F00664f90e8E6B09475C4B804efB11fC2fc07DE';
        }

        return { ...acc, [blockchain]: { gateway, router } };
    },
    {} as Record<
        BlockchainName,
        {
            gateway: string;
            router: string;
        }
    >
);
