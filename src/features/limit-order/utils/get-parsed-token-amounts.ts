import BigNumber from 'bignumber.js';
import { Token, TokenAmount } from 'src/common/tokens';
import { TokenBaseStruct } from 'src/common/tokens/models/token-base-struct';
import { EvmBlockchainName } from 'src/core/blockchain/models/blockchain-name';

export async function getParsedTokenAmounts(
    fromToken: Token<EvmBlockchainName> | TokenBaseStruct<EvmBlockchainName>,
    toToken: string | Token<EvmBlockchainName> | TokenBaseStruct<EvmBlockchainName>,
    fromAmount: BigNumber | string | number,
    toAmount: BigNumber | string | number
): Promise<{
    fromTokenAmount: TokenAmount<EvmBlockchainName>;
    toTokenAmount: TokenAmount<EvmBlockchainName>;
}> {
    const fromTokenAmount = await TokenAmount.createToken({
        ...fromToken,
        tokenAmount: new BigNumber(fromAmount)
    });
    const toTokenParsed =
        typeof toToken === 'string'
            ? { address: toToken, blockchain: fromToken.blockchain }
            : toToken;
    const toTokenAmount = await TokenAmount.createToken({
        ...toTokenParsed,
        tokenAmount: new BigNumber(toAmount)
    });
    return { fromTokenAmount, toTokenAmount };
}
