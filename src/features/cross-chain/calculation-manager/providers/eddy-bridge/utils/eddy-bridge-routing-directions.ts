import { NotSupportedTokensError } from 'src/common/errors';
import { PriceToken, PriceTokenAmount } from 'src/common/tokens';
import { compareAddresses } from 'src/common/utils/blockchain';
import { BLOCKCHAIN_NAME, EvmBlockchainName } from 'src/core/blockchain/models/blockchain-name';

import { TOKEN_SYMBOL_TO_ZETACHAIN_ADDRESS } from '../constants/eddy-bridge-contract-addresses';

// Eddy Routing Direction
export const ERD = {
    ANY_CHAIN_NATIVE_TO_ZETA_NATIVE: 'ANY_CHAIN_NATIVE_TO_ZETA_NATIVE',
    ZETA_NATIVE_TO_ANY_CHAIN_NATIVE: 'ZETA_NATIVE_TO_ANY_CHAIN_NATIVE',
    ZETA_TOKEN_TO_ANY_CHAIN_NATIVE: 'ZETA_TOKEN_TO_ANY_CHAIN_NATIVE'
} as const;

export type EddyRoutingDirection = (typeof ERD)[keyof typeof ERD];

export function eddyRoutingDirection(
    from: PriceTokenAmount<EvmBlockchainName>,
    to: PriceToken<EvmBlockchainName>
): EddyRoutingDirection {
    if (
        from.blockchain === BLOCKCHAIN_NAME.ZETACHAIN &&
        Object.values(TOKEN_SYMBOL_TO_ZETACHAIN_ADDRESS).some(zrc20Address =>
            compareAddresses(zrc20Address, from.address)
        )
    ) {
        return ERD.ZETA_TOKEN_TO_ANY_CHAIN_NATIVE;
    }
    if (from.blockchain === BLOCKCHAIN_NAME.ZETACHAIN && from.isNative) {
        return ERD.ZETA_NATIVE_TO_ANY_CHAIN_NATIVE;
    }
    if (from.blockchain !== BLOCKCHAIN_NAME.ZETACHAIN && from.isNative && to.isNative) {
        return ERD.ANY_CHAIN_NATIVE_TO_ZETA_NATIVE;
    }
    throw new NotSupportedTokensError();
}
