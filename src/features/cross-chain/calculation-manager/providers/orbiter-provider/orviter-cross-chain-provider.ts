import { PriceTokenAmount } from 'src/common/tokens';
import { EvmBlockchainName } from 'src/core/blockchain/models/blockchain-name';

import { CROSS_CHAIN_TRADE_TYPE } from '../../models/cross-chain-trade-type';
import { CrossChainProvider } from '../common/cross-chain-provider';
import { CalculationResult } from '../common/models/calculation-result';
import { RubicStep } from '../common/models/rubicStep';
import { OrbiterTokenSymbols } from './models/orbiter-cross-chain-api-service-types';
import { orbiterSupportedBlockchains } from './models/orbiter-supported-blockchains';
import { OrbiterApiService } from './services/orbiter-api-service';

export class OrbiterCCProvider extends CrossChainProvider {
    public readonly type = CROSS_CHAIN_TRADE_TYPE.ORBITER;

    private orbiterTokens: OrbiterTokenSymbols = {};

    public isSupportedBlockchain(blockchain: EvmBlockchainName): boolean {
        return orbiterSupportedBlockchains.some(
            supportedBlockchain => supportedBlockchain === blockchain
        );
    }

    public async calculate(): Promise<CalculationResult> {
        try {
            this.orbiterTokens = await OrbiterApiService.getTokensData();
            //@ts-ignore
            return { tradeType: this.type };
        } catch (err) {
            const rubicSdkError = CrossChainProvider.parseError(err);

            return {
                trade: null,
                error: rubicSdkError,
                tradeType: this.type
            };
        }
    }

    protected async getRoutePath(
        fromToken: PriceTokenAmount<EvmBlockchainName>,
        toToken: PriceTokenAmount<EvmBlockchainName>
    ): Promise<RubicStep[]> {
        return [{ type: 'cross-chain', provider: this.type, path: [fromToken, toToken] }];
    }
}
