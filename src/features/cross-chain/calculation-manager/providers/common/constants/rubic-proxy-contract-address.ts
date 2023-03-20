import { BLOCKCHAIN_NAME, BlockchainName } from 'src/core/blockchain/models/blockchain-name';

export const rubicProxyContractAddress: Record<
    BlockchainName,
    {
        gateway: string;
        router: string;
    }
> = Object.values(BLOCKCHAIN_NAME).reduce(
    (acc, blockchain) => {
        if (blockchain === BLOCKCHAIN_NAME.POLYGON) {
            return {
                ...acc,
                [blockchain]: {
                    gateway: '0x0906003a194543023Fc42ca60f9a83eB15c06f81',
                    router: '0x7F16a4BcF533C1B5e2E8C89e61468eC0863Cc524'
                }
            };
        }
        return {
            ...acc,
            [blockchain]: {
                gateway: '0x0906003a194543023Fc42ca60f9a83eB15c06f81',
                router: '0x5F00664f90e8E6B09475C4B804efB11fC2fc07DE'
            }
        };
    },
    {} as Record<
        BlockchainName,
        {
            gateway: string;
            router: string;
        }
    >
);
