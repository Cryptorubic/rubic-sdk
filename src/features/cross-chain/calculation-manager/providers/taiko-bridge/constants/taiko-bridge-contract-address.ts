import { BLOCKCHAIN_NAME } from 'src/core/blockchain/models/blockchain-name';
import { UniversalContract } from 'src/features/cross-chain/calculation-manager/providers/common/models/universal-contract';
import { TaikoBridgeSupportedBlockchain } from "../models/taiko-bridge-supported-blockchains";

export const taikoBridgeContractAddress: Record<
    TaikoBridgeSupportedBlockchain,
    UniversalContract
> = {
    [BLOCKCHAIN_NAME.SEPOLIA]: {
        providerGateway: '0x7d992599e1b8b4508ba6e2ba97893b4c36c23a28',
        providerRouter: '0x7d992599e1b8b4508ba6e2ba97893b4c36c23a28',
        rubicRouter: '0x33798753ec66aEc00ed7E337B41F444f53A63333'
    },
    [BLOCKCHAIN_NAME.TAIKO]: {
        providerGateway: '0x21561e1c1c64e18aB02654F365F3b0f7509d9481',
        providerRouter: '0x21561e1c1c64e18aB02654F365F3b0f7509d9481',
        rubicRouter: '0x33798753ec66aEc00ed7E337B41F444f53A63333'
    }
};
