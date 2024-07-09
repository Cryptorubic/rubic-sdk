import { NotSupportedTokensError } from 'src/common/errors';
import { compareAddresses } from 'src/common/utils/blockchain';
import { Injector } from 'src/core/injector/injector';

import { TOKEN_SYMBOL_TO_ZETACHAIN_ADDRESS } from '../constants/eddy-bridge-contract-addresses';
import { ZetaChainForeignCoinsRes } from '../models/eddy-bridge-api-types';

export class EddyBridgeApiService {
    public static async getWeiTokenLimitInForeignChain(tokenSymbol: string): Promise<string> {
        const { foreignCoins } = await Injector.httpClient.get<ZetaChainForeignCoinsRes>(
            `https://zetachain.blockpi.network/lcd/v1/public/zeta-chain/fungible/foreign_coins`
        );
        const zrc20TokenAddress = TOKEN_SYMBOL_TO_ZETACHAIN_ADDRESS[tokenSymbol]!;

        const tokenInfo = foreignCoins.find(token =>
            compareAddresses(token.zrc20_contract_address, zrc20TokenAddress)
        );

        if (!tokenInfo) {
            throw new NotSupportedTokensError();
        }

        return tokenInfo.liquidity_cap;
    }
}
