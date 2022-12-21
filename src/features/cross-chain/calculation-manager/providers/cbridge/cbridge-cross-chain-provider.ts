import { NotSupportedTokensError, RubicSdkError } from 'src/common/errors';
import { PriceToken, PriceTokenAmount, TokenAmount } from 'src/common/tokens';
import { nativeTokensList } from 'src/common/tokens/constants/native-tokens';
import { TokenStruct } from 'src/common/tokens/token';
import { compareAddresses } from 'src/common/utils/blockchain';
import { BlockchainName, EvmBlockchainName } from 'src/core/blockchain/models/blockchain-name';
import { blockchainId } from 'src/core/blockchain/utils/blockchains-info/constants/blockchain-id';
import { Web3Pure } from 'src/core/blockchain/web3-pure/web3-pure';
import { Injector } from 'src/core/injector/injector';
import { getFromWithoutFee } from 'src/features/common/utils/get-from-without-fee';
import { RequiredCrossChainOptions } from 'src/features/cross-chain/calculation-manager/models/cross-chain-options';
import { CROSS_CHAIN_TRADE_TYPE } from 'src/features/cross-chain/calculation-manager/models/cross-chain-trade-type';
import { CbridgeCrossChainApiService } from 'src/features/cross-chain/calculation-manager/providers/cbridge/cbridge-cross-chain-api-service';
import { CbridgeCrossChainTrade } from 'src/features/cross-chain/calculation-manager/providers/cbridge/cbridge-cross-chain-trade';
import { cbridgeContractAddress } from 'src/features/cross-chain/calculation-manager/providers/cbridge/constants/cbridge-contract-address';
import {
    CbridgeCrossChainSupportedBlockchain,
    cbridgeSupportedBlockchains
} from 'src/features/cross-chain/calculation-manager/providers/cbridge/constants/cbridge-supported-blockchains';
import { CbridgeEstimateAmountRequest } from 'src/features/cross-chain/calculation-manager/providers/cbridge/models/cbridge-estimate-amount-request';
import { celerTransitTokens } from 'src/features/cross-chain/calculation-manager/providers/celer-provider/constants/celer-transit-tokens';
import { CelerCrossChainSupportedBlockchain } from 'src/features/cross-chain/calculation-manager/providers/celer-provider/models/celer-cross-chain-supported-blockchain';
import { CrossChainProvider } from 'src/features/cross-chain/calculation-manager/providers/common/cross-chain-provider';
import { evmCommonCrossChainAbi } from 'src/features/cross-chain/calculation-manager/providers/common/emv-cross-chain-trade/constants/evm-common-cross-chain-abi';
import { CalculationResult } from 'src/features/cross-chain/calculation-manager/providers/common/models/calculation-result';
import { FeeInfo } from 'src/features/cross-chain/calculation-manager/providers/common/models/fee-info';
import { multichainProxyContractAbi } from 'src/features/cross-chain/calculation-manager/providers/multichain-provider/dex-multichain-provider/constants/contract-abi';
import { multichainProxyContractAddress } from 'src/features/cross-chain/calculation-manager/providers/multichain-provider/dex-multichain-provider/constants/contract-address';
import { MultichainProxyCrossChainSupportedBlockchain } from 'src/features/cross-chain/calculation-manager/providers/multichain-provider/dex-multichain-provider/models/supported-blockchain';
import { typedTradeProviders } from 'src/features/on-chain/calculation-manager/constants/trade-providers/typed-trade-providers';
import { EvmOnChainTrade } from 'src/features/on-chain/calculation-manager/providers/common/on-chain-trade/evm-on-chain-trade/evm-on-chain-trade';

export class CbridgeCrossChainProvider extends CrossChainProvider {
    public readonly type = CROSS_CHAIN_TRADE_TYPE.CELER;

    public isSupportedBlockchain(
        blockchain: BlockchainName
    ): blockchain is CbridgeCrossChainSupportedBlockchain {
        return cbridgeSupportedBlockchains.some(
            supportedBlockchain => supportedBlockchain === blockchain
        );
    }

    public async calculate(
        fromToken: PriceTokenAmount<EvmBlockchainName>,
        toToken: PriceToken<EvmBlockchainName>,
        options: RequiredCrossChainOptions
    ): Promise<CalculationResult> {
        const fromBlockchain = fromToken.blockchain as CbridgeCrossChainSupportedBlockchain;
        const toBlockchain = toToken.blockchain as CbridgeCrossChainSupportedBlockchain;
        if (!this.areSupportedBlockchains(fromBlockchain, toBlockchain)) {
            return null;
        }

        try {
            await this.checkContractState(
                fromBlockchain,
                cbridgeContractAddress[fromBlockchain].rubicRouter,
                evmCommonCrossChainAbi
            );

            const config = await this.fetchContractAddressAndCheckTokens(fromToken, toToken);

            const feeInfo = await this.getFeeInfo(fromBlockchain, options.providerAddress);
            const fromWithoutFee = getFromWithoutFee(
                fromToken,
                feeInfo.rubicProxy?.platformFee?.percent
            );

            let onChainTrade: EvmOnChainTrade | null = null;
            let transitTokenAmount = fromWithoutFee.tokenAmount;
            let transitMinAmount = transitTokenAmount;

            if (!config.supportedFromToken) {
                const whiteListedDexes = await this.getWhitelistedDexes(fromBlockchain);
                onChainTrade = await this.getOnChainTrade(
                    fromWithoutFee,
                    whiteListedDexes,
                    options.slippageTolerance
                );
                if (!onChainTrade) {
                    return {
                        trade: null,
                        error: new NotSupportedTokensError()
                    };
                }

                transitTokenAmount = onChainTrade.to.tokenAmount;
                transitMinAmount = onChainTrade.toTokenAmountMin.tokenAmount;
            }

            const transitToken = new TokenAmount<EvmBlockchainName>({
                ...(celerTransitTokens[
                    fromToken.blockchain as CelerCrossChainSupportedBlockchain
                ] as TokenStruct<EvmBlockchainName>),
                tokenAmount: transitTokenAmount
            });

            const { amount, maxSlippage } = await this.getEstimates(transitToken, toToken, options);

            const to = new PriceTokenAmount({
                ...toToken.asStruct,
                tokenAmount: Web3Pure.fromWei(amount, toToken.decimals)
            });

            const gasData =
                options.gasCalculation === 'enabled'
                    ? await CbridgeCrossChainTrade.getGasData(fromToken, to, onChainTrade)
                    : null;

            return {
                trade: new CbridgeCrossChainTrade(
                    {
                        from: fromToken,
                        to,
                        gasData,
                        priceImpact: fromToken.calculatePriceImpactPercent(to) || 0,
                        slippage: options.slippageTolerance,
                        feeInfo,
                        maxSlippage,
                        contractAddress: config.address,
                        transitMinAmount,
                        onChainTrade
                    },
                    options.providerAddress
                )
            };
        } catch (err) {
            const rubicSdkError = CrossChainProvider.parseError(err);

            return {
                trade: null,
                error: rubicSdkError
            };
        }
    }

    protected async getFeeInfo(
        fromBlockchain: CbridgeCrossChainSupportedBlockchain,
        providerAddress: string
    ): Promise<FeeInfo> {
        return {
            rubicProxy: {
                fixedFee: {
                    amount: await this.getFixedFee(
                        fromBlockchain,
                        providerAddress,
                        cbridgeContractAddress[fromBlockchain].rubicRouter,
                        evmCommonCrossChainAbi
                    ),
                    tokenSymbol: nativeTokensList[fromBlockchain].symbol
                },
                platformFee: {
                    percent: await this.getFeePercent(
                        fromBlockchain,
                        providerAddress,
                        cbridgeContractAddress[fromBlockchain].rubicRouter,
                        evmCommonCrossChainAbi
                    ),
                    tokenSymbol: 'USDC'
                }
            }
        };
    }

    private async fetchContractAddressAndCheckTokens(
        fromToken: PriceTokenAmount<EvmBlockchainName>,
        toToken: PriceToken<EvmBlockchainName>
    ): Promise<{ address: string; supportedFromToken: boolean; supportedToToken: boolean }> {
        const config = await CbridgeCrossChainApiService.getTransferConfigs();

        const fromChainId = blockchainId[fromToken.blockchain];
        const toChainId = blockchainId[toToken.blockchain];
        if (
            !config.chains.some(chain => chain.id === fromChainId) ||
            !config.chains.some(chain => chain.id === toChainId)
        ) {
            throw new RubicSdkError('Not supported chain');
        }

        const supportedFromToken = !!config.chain_token?.[fromChainId]?.token.some(el =>
            compareAddresses(el.token.address, fromToken.address)
        );
        const supportedToToken = !!config.chain_token?.[toChainId]?.token.some(el =>
            compareAddresses(el.token.address, toToken.address)
        );

        return {
            supportedFromToken,
            supportedToToken,
            address: config.chains.find(chain => chain.id === fromChainId)!.contract_addr
        };
    }

    private async getEstimates(
        fromToken: TokenAmount<EvmBlockchainName>,
        toToken: PriceToken<EvmBlockchainName>,
        options: RequiredCrossChainOptions
    ): Promise<{ amount: string; maxSlippage: number }> {
        const requestParams: CbridgeEstimateAmountRequest = {
            src_chain_id: blockchainId[fromToken.blockchain],
            dst_chain_id: blockchainId[toToken.blockchain],
            token_symbol: fromToken.symbol,
            usr_addr: options?.receiverAddress || this.getWalletAddress(fromToken.blockchain),
            slippage_tolerance: Number((options.slippageTolerance * 1_000_000).toFixed(0)),
            amt: fromToken.stringWeiAmount
        };
        const { eq_value_token_amt, max_slippage } =
            await CbridgeCrossChainApiService.fetchEstimateAmount(requestParams);
        return { amount: eq_value_token_amt, maxSlippage: max_slippage };
    }

    private async getOnChainTrade(
        from: PriceTokenAmount,
        availableDexes: string[],
        slippageTolerance: number
    ): Promise<EvmOnChainTrade | null> {
        const fromBlockchain = from.blockchain as CelerCrossChainSupportedBlockchain;

        const dexes = Object.values(typedTradeProviders[fromBlockchain]).filter(
            dex => dex.supportReceiverAddress
        );
        const to = await PriceToken.createToken({
            address: celerTransitTokens[fromBlockchain].address,
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
                    compareAddresses(availableDex, onChainTrade.dexContractAddress)
                )
            )
            .sort((a, b) => b.to.tokenAmount.comparedTo(a.to.tokenAmount));

        if (!onChainTrades.length) {
            return null;
        }
        return onChainTrades[0]!;
    }

    private getWhitelistedDexes(
        fromBlockchain: MultichainProxyCrossChainSupportedBlockchain
    ): Promise<string[]> {
        const web3Public = Injector.web3PublicService.getWeb3Public(fromBlockchain);
        return web3Public.callContractMethod<string[]>(
            multichainProxyContractAddress[fromBlockchain],
            multichainProxyContractAbi,
            'getAvailableRouters'
        );
    }
}
