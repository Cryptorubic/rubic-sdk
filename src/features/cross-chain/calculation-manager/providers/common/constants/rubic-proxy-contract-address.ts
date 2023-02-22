import { BLOCKCHAIN_NAME, BlockchainName } from 'src/core/blockchain/models/blockchain-name';

export const rubicProxyContractAddress: Record<
    BlockchainName,
    {
        gateway: string;
        router: string;
    }
> = Object.values(BLOCKCHAIN_NAME).reduce(
    (acc, blockchain) => {
        if (blockchain === BLOCKCHAIN_NAME.BINANCE_SMART_CHAIN) {
            return {
                ...acc,
                [blockchain]: {
                    gateway: '0x03260E497f1106B8562068A8673B8bCEBB9da123',
                    router: '0x11e370396AcE2B5d1056D5B0d46316fE08c073a6'
                }
            };
        }
        // if (blockchain === BLOCKCHAIN_NAME.POLYGON) {
        //     contractAddress = '0x6c85a9ed880565f30852ebf5f0da97b5e80aa328';
        //     x
        // }
        // if (blockchain === BLOCKCHAIN_NAME.TRON) {
        //     contractAddress = 'TYfrVeJLCokb4fpK5Fx29BoVfyoBFrW1C4';
        // }
        return {
            ...acc,
            [blockchain]: {
                gateway: '0x5EFa20dC7816cAE2d1142966eAA7eff71CdB2A54',
                router: '0x8a7f697958725Da3CF1dE1fDCcD7C25780e8dB89'
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
