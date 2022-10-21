import {
    MultichainProxyCrossChainSupportedBlockchain,
    multichainProxyCrossChainSupportedBlockchains
} from 'src/features/cross-chain/calculation-manager/providers/multichain-provider/dex-multichain-provider/models/supported-blockchain';
import { BLOCKCHAIN_NAME } from 'src/core/blockchain/models/blockchain-name';

export const multichainProxyContractAddress: Record<
    MultichainProxyCrossChainSupportedBlockchain,
    string
> = multichainProxyCrossChainSupportedBlockchains.reduce((acc, blockchain) => {
    let routerAddress = '0x41e7056A16B35E5E09214d6F7d43C90D9DEC1630';
    if (blockchain === BLOCKCHAIN_NAME.POLYGON) {
        routerAddress = '0xC85A61d178bBdDc7752C6618bA498074cD6FA9f1';
    }
    if (blockchain === BLOCKCHAIN_NAME.KAVA) {
        routerAddress = '0x7a3bAc61d5b3b476cC774fa2209f1035BD01a4eF';
    }
    return {
        ...acc,
        [blockchain]: routerAddress
    };
}, {} as Record<MultichainProxyCrossChainSupportedBlockchain, string>);
