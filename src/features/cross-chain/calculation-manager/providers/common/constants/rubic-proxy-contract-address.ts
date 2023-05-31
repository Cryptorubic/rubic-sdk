import { BLOCKCHAIN_NAME, BlockchainName } from 'src/core/blockchain/models/blockchain-name';

export const rubicProxyContractAddress: Record<
    BlockchainName,
    {
        gateway: string;
        router: string;
    }
> = Object.values(BLOCKCHAIN_NAME).reduce(
    (acc, blockchain) => {
        let gateway = '0x91ba630F63991A15D35f69F57ef0C931fD8BB5f6';
        let router = '0xb177ba361941bA2C382484e83ba521451557901f';
        if (blockchain === BLOCKCHAIN_NAME.TELOS) {
            router = '0xA2d8CF32C16f070702c45a5686Fdb0a1d7171AAD';
        }
        if (blockchain === BLOCKCHAIN_NAME.ZK_SYNC) {
            router = '0xa63c029612ddaD00A269383Ab016D1e7c14E851D';
            gateway = '0x8E70e517057e7380587Ea6990dAe81cB1Ba405ce';
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
