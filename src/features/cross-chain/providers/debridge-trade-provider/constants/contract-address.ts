import {
    DeBridgeCrossChainSupportedBlockchain,
    deBridgeCrossChainSupportedBlockchains
} from 'src/features/cross-chain/providers/debridge-trade-provider/constants/debridge-cross-chain-supported-blockchain';
import { UniversalContract } from 'src/features/cross-chain/providers/common/models/universal-contract';
import { rubicProxyContractAddress } from 'src/features/cross-chain/constants/rubic-proxy-contract-address';

const defaultContracts = {
    providerRouter: '0x663DC15D3C1aC63ff12E45Ab68FeA3F0a883C251',
    providerGateway: '0x663DC15D3C1aC63ff12E45Ab68FeA3F0a883C251'
};

export const DE_BRIDGE_CONTRACT_ADDRESS: Record<
    DeBridgeCrossChainSupportedBlockchain,
    UniversalContract
> = deBridgeCrossChainSupportedBlockchains.reduce((acc, blockchain) => {
    return {
        ...acc,
        [blockchain]: {
            ...defaultContracts,
            rubicRouter: rubicProxyContractAddress[blockchain]
        }
    };
}, {} as Record<DeBridgeCrossChainSupportedBlockchain, UniversalContract>);
