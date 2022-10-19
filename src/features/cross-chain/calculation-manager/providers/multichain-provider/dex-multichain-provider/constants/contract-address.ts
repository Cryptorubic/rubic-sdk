import {
    MultichainProxyCrossChainSupportedBlockchain,
    multichainProxyCrossChainSupportedBlockchains
} from 'src/features/cross-chain/calculation-manager/providers/multichain-provider/dex-multichain-provider/models/supported-blockchain';
import { BLOCKCHAIN_NAME } from 'src/core/blockchain/models/blockchain-name';

export const multichainProxyContractAddress: Record<
    MultichainProxyCrossChainSupportedBlockchain,
    string
> = multichainProxyCrossChainSupportedBlockchains.reduce((acc, blockchain) => {
    let routerAddress = '0x4c4bF5f46071ff2a5846395fc22ba7B2C782eEd5';
    if (blockchain === BLOCKCHAIN_NAME.KAVA) {
        routerAddress = '0x0C8f0d522094689E9eFeB2576AB60d54B85209dF';
    }
    return {
        ...acc,
        [blockchain]: routerAddress
    };
}, {} as Record<MultichainProxyCrossChainSupportedBlockchain, string>);
