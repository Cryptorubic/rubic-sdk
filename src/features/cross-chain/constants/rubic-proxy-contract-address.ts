import { BLOCKCHAIN_NAME, BlockchainName } from 'src/core';
import { rubicCrossChainRouterAddress } from 'src/features/cross-chain/constants/rubic-cross-chain-router-address';

export const rubicProxyContractAddress: Record<BlockchainName, string> = Object.values(
    BLOCKCHAIN_NAME
).reduce((acc, blockchain) => {
    let contractAddress = rubicCrossChainRouterAddress;
    if (blockchain === BLOCKCHAIN_NAME.OKE_X_CHAIN || blockchain === BLOCKCHAIN_NAME.BOBA) {
        contractAddress = '0x3332241a5a4eCb4c28239A9731ad45De7f000333';
    }
    return {
        ...acc,
        [blockchain]: contractAddress
    };
}, {} as Record<BlockchainName, string>);
