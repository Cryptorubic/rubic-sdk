import { RubicSdkError } from 'src/common/errors';
import { PriceTokenAmount } from 'src/common/tokens';
import { EvmBlockchainName } from 'src/core/blockchain/models/blockchain-name';
import { blockchainId } from 'src/core/blockchain/utils/blockchains-info/constants/blockchain-id';
import { Injector } from 'src/core/injector/injector';

import { OwlToAllChainsResponse, OwlToTokensResponse } from '../models/owl-to-api-types';

export class OwlToApiService {
    private static apiUrl = 'https://owlto.finance/';

    public static async getTargetNetworkCode(targetChainId: number): Promise<string> {
        const { msg: chains } = await Injector.httpClient.get<OwlToAllChainsResponse>(
            `${this.apiUrl}/api/config/all-chains`
        );

        const chain = chains.find(c => c.chainId === targetChainId);

        if (!chain) {
            throw new RubicSdkError('[OWL_TO_BRIDGE] Unsupported chain!');
        }

        return chain.networkCode.toString();
    }

    public static async getSourceTokenMinMaxAmounts(
        sourceToken: PriceTokenAmount<EvmBlockchainName>
    ): Promise<{ min: number; max: number }> {
        const sourceChainId = blockchainId[sourceToken.blockchain];

        const { msg: tokens } = await Injector.httpClient.get<OwlToTokensResponse>(
            `${this.apiUrl}/api/config/filter-from-to-chains`,
            {
                params: {
                    token: sourceToken.symbol,
                    base_chainid: sourceChainId
                }
            }
        );

        const foundToken = tokens.find(t => {
            const sourceSymbolToLow = sourceToken.symbol.toLowerCase();
            const tSymbolToLow = t.symbol.toLowerCase();
            const sourceAddrToLow = sourceToken.address.toLowerCase();
            const tAddrToLow = t.fromAddress.toLowerCase();

            if (tAddrToLow === sourceAddrToLow) {
                return true;
            }
            if (sourceSymbolToLow.includes(tSymbolToLow) && t.fromChainId === sourceChainId) {
                return true;
            }
            return false;
        });

        if (!foundToken) {
            throw new RubicSdkError('[OWL_TO_BRIDGE] Unsupported token!');
        }

        return { max: foundToken.maxValue, min: foundToken.minValue };
    }
}
