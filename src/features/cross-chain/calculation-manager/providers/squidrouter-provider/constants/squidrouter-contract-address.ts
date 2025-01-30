import { BLOCKCHAIN_NAME } from 'src/core/blockchain/models/blockchain-name';
import { rubicProxyContractAddress } from 'src/features/cross-chain/calculation-manager/providers/common/constants/rubic-proxy-contract-address';
import { UniversalContract } from 'src/features/cross-chain/calculation-manager/providers/common/models/universal-contract';
import {
    SquidrouterCrossChainSupportedBlockchain,
    squidrouterCrossChainSupportedBlockchains
} from 'src/features/cross-chain/calculation-manager/providers/squidrouter-provider/constants/squidrouter-cross-chain-supported-blockchain';

export const SquidrouterContractAddress: Record<
    SquidrouterCrossChainSupportedBlockchain,
    UniversalContract
> = squidrouterCrossChainSupportedBlockchains.reduce((acc, blockchain) => {
    if (blockchain === BLOCKCHAIN_NAME.FRAXTAL) {
        return {
            ...acc,
            [blockchain]: {
                providerRouter: '0xDC3D8e1Abe590BCa428a8a2FC4CfDbD1AcF57Bd9',
                providerGateway: '0xDC3D8e1Abe590BCa428a8a2FC4CfDbD1AcF57Bd9',
                rubicRouter: rubicProxyContractAddress[blockchain].gateway
            }
        };
    }
    return {
        ...acc,
        [blockchain]: {
            providerRouter: '0xce16F69375520ab01377ce7B88f5BA8C48F8D666',
            providerGateway: '0xce16F69375520ab01377ce7B88f5BA8C48F8D666',
            rubicRouter: rubicProxyContractAddress[blockchain].gateway
        }
    };
}, {} as Record<SquidrouterCrossChainSupportedBlockchain, UniversalContract>);
