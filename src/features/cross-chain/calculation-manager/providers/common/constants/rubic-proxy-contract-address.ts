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
        let router = '0x6AA981bFF95eDfea36Bdae98C26B274FfcafE8d3';
        if (blockchain === BLOCKCHAIN_NAME.TELOS) {
            router = '0xA2d8CF32C16f070702c45a5686Fdb0a1d7171AAD';
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
