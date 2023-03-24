import { BLOCKCHAIN_NAME, BlockchainName } from 'src/core/blockchain/models/blockchain-name';

export const rubicProxyContractAddress: Record<
    BlockchainName,
    {
        gateway: string;
        router: string;
    }
> = Object.values(BLOCKCHAIN_NAME).reduce(
    (acc, blockchain) => {
        const gateway = '0x3335733c454805df6a77f825f266e136FB4a3333';
        const router = '0x6AA981bFF95eDfea36Bdae98C26B274FfcafE8d3';

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
