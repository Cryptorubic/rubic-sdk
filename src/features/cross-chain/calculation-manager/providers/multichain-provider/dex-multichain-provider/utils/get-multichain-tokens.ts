import { blockchainId } from 'src/core/blockchain/utils/blockchains-info/constants/blockchain-id';
import {
    MultichainSourceToken,
    MultichainTargetToken,
    MultichainTokensResponse
} from 'src/features/cross-chain/calculation-manager/providers/multichain-provider/models/tokens-api';
import { Token } from 'src/common/tokens';
import { Injector } from 'src/core/injector/injector';
import { BlockchainName } from 'src/core/blockchain/models/blockchain-name';

export async function getMultichainTokens(
    from: Token,
    toBlockchain: BlockchainName
): Promise<{ sourceToken: MultichainSourceToken; targetToken: MultichainTargetToken } | null> {
    const fromChainId = blockchainId[from.blockchain];
    const tokensList = await Injector.httpClient.get<MultichainTokensResponse>(
        `https://bridgeapi.anyswap.exchange/v4/tokenlistv4/${fromChainId}`
    );
    const sourceToken = Object.entries(tokensList).find(([address, token]) => {
        return (
            (token.tokenType === 'NATIVE' && from.isNative) ||
            (token.tokenType === 'TOKEN' &&
                address.toLowerCase().endsWith(from.address.toLowerCase()))
        );
    })?.[1];
    if (!sourceToken) {
        return null;
    }

    const toChainId = blockchainId[toBlockchain];
    const dstChainInformation = sourceToken?.destChains[toChainId.toString()];
    if (!sourceToken || !dstChainInformation) {
        return null;
    }

    const targetToken = Object.values(dstChainInformation)[0];
    if (!targetToken) {
        return null;
    }

    return { sourceToken, targetToken };
}
