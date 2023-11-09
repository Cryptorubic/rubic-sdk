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
    if(
        blockchain === BLOCKCHAIN_NAME.BINANCE_SMART_CHAIN_TESTNET ||
        blockchain === BLOCKCHAIN_NAME.GOERLI ||
        blockchain === BLOCKCHAIN_NAME.MUMBAI
    )   return {
        ...acc,
        [blockchain]: {
            providerRouter: '0xC3468a191Fe51815b26535ED1F82C1f79e6Ec37D',
            providerGateway: '0xC3468a191Fe51815b26535ED1F82C1f79e6Ec37D',
            rubicRouter: rubicProxyContractAddress[blockchain].gateway
        }
    };
    return {
        ...acc,
        [blockchain]: {
            providerRouter: '0xce16F69375520ab01377ce7B88f5BA8C48F8D666',
            providerGateway: '0xce16F69375520ab01377ce7B88f5BA8C48F8D666',
            rubicRouter: rubicProxyContractAddress[blockchain].gateway
        }
    };
}, {} as Record<SquidrouterCrossChainSupportedBlockchain, UniversalContract>);
