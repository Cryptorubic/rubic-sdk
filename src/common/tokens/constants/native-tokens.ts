import { nativeTokensStruct } from 'src/common/tokens/constants/native-token-struct';
import { Token } from 'src/common/tokens/token';
import { BlockchainName } from 'src/core/blockchain/models/blockchain-name';

const test = Object.entries(nativeTokensStruct).map(params => {
    const [chain, struct] = params;
    return [chain, new Token(struct)];
});
export const nativeTokensList: Record<BlockchainName, Token> = Object.fromEntries(test) as Record<
    BlockchainName,
    Token
>;
