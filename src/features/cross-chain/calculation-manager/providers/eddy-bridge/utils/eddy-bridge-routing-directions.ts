import { NotSupportedTokensError } from 'src/common/errors';
import { PriceToken, PriceTokenAmount } from 'src/common/tokens';
import { compareAddresses } from 'src/common/utils/blockchain';
import { BLOCKCHAIN_NAME, EvmBlockchainName } from 'src/core/blockchain/models/blockchain-name';

import { ZETA_CHAIN_SUPPORTED_TOKENS } from '../constants/eddy-bridge-contract-addresses';
import { findCompatibleZrc20TokenAddress } from './find-transit-token-address';

// Eddy Routing Direction
export const ERD = {
    ANY_CHAIN_NATIVE_TO_ZETA_NATIVE: 'ANY_CHAIN_NATIVE_TO_ZETA_NATIVE',
    ANY_CHAIN_NATIVE_TO_ZETA_TOKEN: 'ANY_CHAIN_NATIVE_TO_ZETA_TOKEN',
    ZETA_NATIVE_TO_ANY_CHAIN_ALL: 'ZETA_NATIVE_TO_ANY_CHAIN_ALL',
    ZETA_TOKEN_TO_ANY_CHAIN_ALL: 'ZETA_TOKEN_TO_ANY_CHAIN_ALL',
    ANY_CHAIN_NATIVE_TO_ANY_CHAIN_TOKEN: 'ANY_CHAIN_NATIVE_TO_ANY_CHAIN_TOKEN',
    ANY_CHAIN_TOKEN_TO_ANY_CHAIN_TOKEN: 'ANY_CHAIN_TOKEN_TO_ANY_CHAIN_TOKEN',
    ANY_CHAIN_TOKEN_TO_ZETA_TOKEN: 'ANY_CHAIN_TOKEN_TO_ZETA_TOKEN'
} as const;

export type EddyRoutingDirection = (typeof ERD)[keyof typeof ERD];

export const EDDY_CALCULATION_TYPES = {
    DIRECT_BRIDGE: 'DIRECT_BRIDGE',
    SWAP_FROM_ZETACHAIN: 'SWAP_FROM_ZETACHAIN',
    SWAP_TO_ZETACHAIN: 'SWAP_TO_ZETACHAIN',
    SWAP_BETWEEN_OTHER_CHAINS: 'SWAP_BETWEEN_OTHER_CHAINS'
} as const;

export type EddyCalculationType =
    (typeof EDDY_CALCULATION_TYPES)[keyof typeof EDDY_CALCULATION_TYPES];

// eslint-disable-next-line complexity
export function eddyRoutingDirection(
    from: PriceTokenAmount<EvmBlockchainName>,
    to: PriceToken<EvmBlockchainName>
): EddyRoutingDirection {
    if (from.blockchain === BLOCKCHAIN_NAME.ZETACHAIN) {
        const isSupportedFromToken = ZETA_CHAIN_SUPPORTED_TOKENS.some(zrcToken =>
            compareAddresses(zrcToken.address, from.address)
        );
        const isSupportedToToken = !!findCompatibleZrc20TokenAddress(to);

        if (from.isNative && isSupportedToToken) return ERD.ZETA_NATIVE_TO_ANY_CHAIN_ALL;
        if (isSupportedFromToken && isSupportedToToken) return ERD.ZETA_TOKEN_TO_ANY_CHAIN_ALL;
    }

    if (
        from.blockchain !== BLOCKCHAIN_NAME.ZETACHAIN &&
        to.blockchain === BLOCKCHAIN_NAME.ZETACHAIN
    ) {
        const isSupportedToToken = ZETA_CHAIN_SUPPORTED_TOKENS.some(zrcToken =>
            compareAddresses(zrcToken.address, to.address)
        );
        const isSupportedFromToken = !!findCompatibleZrc20TokenAddress(from);

        if (from.isNative && to.isNative) return ERD.ANY_CHAIN_NATIVE_TO_ZETA_NATIVE;
        if (from.isNative && isSupportedToToken) return ERD.ANY_CHAIN_NATIVE_TO_ZETA_TOKEN;
        if (!from.isNative && isSupportedToToken && isSupportedFromToken && !to.isNative) {
            return ERD.ANY_CHAIN_TOKEN_TO_ZETA_TOKEN;
        }
    }
    // BSC <-> ETH routes are not supported

    // if (
    //     from.blockchain !== BLOCKCHAIN_NAME.ZETACHAIN &&
    //     to.blockchain !== BLOCKCHAIN_NAME.ZETACHAIN
    // ) {
    //     if (from.isNative && !to.isNative) return ERD.ANY_CHAIN_NATIVE_TO_ANY_CHAIN_TOKEN;
    //     if (!from.isNative && !to.isNative) return ERD.ANY_CHAIN_TOKEN_TO_ANY_CHAIN_TOKEN;
    // }

    throw new NotSupportedTokensError();
}

/**
 * Check if route is Bsc(ETH) <-> Ethereum(ETH), Ethereum(USDT) <-> Zetachain(USDT.ETH) etc.
 */
export function isDirectBridge(
    from: PriceTokenAmount<EvmBlockchainName>,
    toToken: PriceToken<EvmBlockchainName>
): boolean {
    return compareAddresses(from.symbol, toToken.symbol);
}

export function getEddyCalculationType(
    from: PriceTokenAmount<EvmBlockchainName>,
    toToken: PriceToken<EvmBlockchainName>
): EddyCalculationType {
    if (isDirectBridge(from, toToken)) {
        return EDDY_CALCULATION_TYPES.DIRECT_BRIDGE;
    }
    if (from.blockchain === BLOCKCHAIN_NAME.ZETACHAIN) {
        return EDDY_CALCULATION_TYPES.SWAP_FROM_ZETACHAIN;
    }
    if (toToken.blockchain === BLOCKCHAIN_NAME.ZETACHAIN) {
        return EDDY_CALCULATION_TYPES.SWAP_TO_ZETACHAIN;
    }
    return EDDY_CALCULATION_TYPES.SWAP_BETWEEN_OTHER_CHAINS;
}
