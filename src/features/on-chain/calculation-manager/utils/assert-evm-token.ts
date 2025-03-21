import { RubicSdkError } from 'src/common/errors';
import { PriceTokenAmount, Token } from 'src/common/tokens';
import { EvmBlockchainName } from 'src/core/blockchain/models/blockchain-name';
import { BlockchainsInfo } from 'src/core/blockchain/utils/blockchains-info/blockchains-info';

export function assertEvmToken(token: Token): asserts token is PriceTokenAmount<EvmBlockchainName> {
    if (!BlockchainsInfo.isEvmBlockchainName(token.blockchain)) {
        throw new RubicSdkError(`assertEvmToken_Error ==> ${token.blockchain} is not evm chain.`);
    }
}
