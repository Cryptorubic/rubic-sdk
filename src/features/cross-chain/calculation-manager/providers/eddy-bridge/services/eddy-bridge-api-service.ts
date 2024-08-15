import { NotSupportedTokensError } from 'src/common/errors';
import { PriceTokenAmount } from 'src/common/tokens';
import { compareAddresses } from 'src/common/utils/blockchain';
import { EvmBlockchainName } from 'src/core/blockchain/models/blockchain-name';
import { Injector } from 'src/core/injector/injector';

import { ZetaChainForeignCoinsRes } from '../models/eddy-bridge-api-types';
import { findCompatibleZrc20TokenAddress } from '../utils/find-transit-token-address';

export class EddyBridgeApiService {
    public static async getWeiTokenLimitInForeignChain(
        fromWithoutFee: PriceTokenAmount<EvmBlockchainName>
    ): Promise<string> {
        const { foreignCoins } = await Injector.httpClient.get<ZetaChainForeignCoinsRes>(
            `https://zetachain.blockpi.network/lcd/v1/public/zeta-chain/fungible/foreign_coins`
        );
        const zrc20TokenAddress = findCompatibleZrc20TokenAddress(fromWithoutFee);

        const tokenInfo = foreignCoins.find(token =>
            compareAddresses(token.zrc20_contract_address, zrc20TokenAddress)
        );

        if (!tokenInfo) {
            throw new NotSupportedTokensError();
        }

        return tokenInfo.liquidity_cap;
    }
}
