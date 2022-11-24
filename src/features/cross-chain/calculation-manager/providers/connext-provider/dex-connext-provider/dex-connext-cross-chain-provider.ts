import { PriceToken, PriceTokenAmount } from 'src/common/tokens';
import { EvmOnChainTrade } from 'src/features/on-chain/calculation-manager/providers/abstract/on-chain-trade/evm-on-chain-trade/evm-on-chain-trade';
import { typedTradeProviders } from 'src/features/on-chain/calculation-manager/constants/trade-providers/typed-trade-providers';
import { EvmWeb3Pure } from 'src/core/blockchain/web3-pure/typed-web3-pure/evm-web3-pure';
import { compareAddresses } from 'src/common/utils/blockchain';
import { BlockchainName, EvmBlockchainName } from 'src/core/blockchain/models/blockchain-name';
import { ConnextCrossChainProvider } from '../connext-cross-chain-provider';
import {
    ConnextCrossChainSupportedBlockchain,
    connextSupportedBlockchains
} from '../constants/connext-supported-blockchains';
import { RequiredCrossChainOptions } from '../../../models/cross-chain-options';
import { CalculationResult } from '../../common/models/calculation-result';
import { CrossChainProvider } from '../../common/cross-chain-provider';

export class DexConnextCrossChainProvider extends ConnextCrossChainProvider {
    public isSupportedBlockchain(
        blockchain: BlockchainName
    ): blockchain is ConnextCrossChainSupportedBlockchain {
        return connextSupportedBlockchains.some(
            supportedBlockchain => supportedBlockchain === blockchain
        );
    }

    public async calculate(
        from: PriceTokenAmount<EvmBlockchainName>,
        toToken: PriceToken,
        _options: RequiredCrossChainOptions
    ): Promise<CalculationResult> {
        const fromBlockchain = from.blockchain as ConnextCrossChainSupportedBlockchain;
        const toBlockchain = toToken.blockchain as ConnextCrossChainSupportedBlockchain;
        if (!this.areSupportedBlockchains(fromBlockchain, toBlockchain)) {
            return null;
        }

        try {
            return null;
        } catch (err: unknown) {
            return {
                trade: null,
                error: CrossChainProvider.parseError(err)
            };
        }
    }

    private async getOnChainTrade(
        from: PriceTokenAmount,
        _transitToken: PriceTokenAmount,
        availableDexes: string[],
        slippageTolerance: number
    ): Promise<EvmOnChainTrade | null> {
        const fromBlockchain = from.blockchain as ConnextCrossChainSupportedBlockchain;

        // @TODO Add filter before promise resolving.
        const dexes = Object.values(typedTradeProviders[fromBlockchain]);
        const to = await PriceToken.createToken({
            address: EvmWeb3Pure.nativeTokenAddress,
            blockchain: fromBlockchain
        });
        const onChainTrades = (
            await Promise.allSettled(
                dexes.map(dex =>
                    dex.calculate(from, to, {
                        slippageTolerance,
                        gasCalculation: 'disabled'
                    })
                )
            )
        )
            .filter(value => value.status === 'fulfilled')
            .map(value => (value as PromiseFulfilledResult<EvmOnChainTrade>).value)
            .filter(onChainTrade =>
                availableDexes.some(availableDex =>
                    compareAddresses(availableDex, onChainTrade.contractAddress)
                )
            )
            .sort((a, b) => b.to.tokenAmount.comparedTo(a.to.tokenAmount));

        if (!onChainTrades.length) {
            return null;
        }
        return onChainTrades[0]!;
    }
}
