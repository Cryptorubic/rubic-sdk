import { NotSupportedTokensError } from 'src/common/errors';
import { PriceToken } from 'src/common/tokens';
import { compareAddresses } from 'src/common/utils/blockchain';
import { EvmBlockchainName } from 'src/core/blockchain/models/blockchain-name';

import { ZETA_CHAIN_SUPPORTED_TOKENS } from '../constants/eddy-bridge-contract-addresses';

export function findCompatibleZrc20TokenAddress(token: PriceToken<EvmBlockchainName>): string {
    const transitTokenInZetachain = ZETA_CHAIN_SUPPORTED_TOKENS.find(
        zrcToken =>
            compareAddresses(zrcToken.symbol, token.symbol) &&
            zrcToken.relativeChain === token.blockchain
    );
    if (!transitTokenInZetachain) throw new NotSupportedTokensError();

    return transitTokenInZetachain.address;
}
