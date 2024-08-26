import { PriceToken } from 'src/common/tokens';
import { wrappedNativeTokensList } from 'src/common/tokens/constants/wrapped-native-tokens';
import { BLOCKCHAIN_NAME, EvmBlockchainName } from 'src/core/blockchain/models/blockchain-name';
import { findCompatibleZrc20TokenAddress } from 'src/features/cross-chain/calculation-manager/providers/eddy-bridge/utils/find-transit-token-address';

export function findApiTokenAddress(token: PriceToken<EvmBlockchainName>): string {
    if (token.blockchain === BLOCKCHAIN_NAME.ZETACHAIN) {
        return token.isNative
            ? wrappedNativeTokensList[BLOCKCHAIN_NAME.ZETACHAIN]!.address
            : token.address;
    }

    return findCompatibleZrc20TokenAddress(token);
}
