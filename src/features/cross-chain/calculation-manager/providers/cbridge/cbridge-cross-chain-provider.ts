import { RubicSdkError } from 'src/common/errors';
import { PriceToken, PriceTokenAmount } from 'src/common/tokens';
import { nativeTokensList } from 'src/common/tokens/constants/native-tokens';
import { compareAddresses } from 'src/common/utils/blockchain';
import { BlockchainName, EvmBlockchainName } from 'src/core/blockchain/models/blockchain-name';
import { blockchainId } from 'src/core/blockchain/utils/blockchains-info/constants/blockchain-id';
import { Web3Pure } from 'src/core/blockchain/web3-pure/web3-pure';
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
import { CrossChainProvider } from 'src/features/cross-chain/calculation-manager/providers/common/cross-chain-provider';
import { evmCommonCrossChainAbi } from 'src/features/cross-chain/calculation-manager/providers/common/emv-cross-chain-trade/constants/evm-common-cross-chain-abi';
import { CalculationResult } from 'src/features/cross-chain/calculation-manager/providers/common/models/calculation-result';
import { FeeInfo } from 'src/features/cross-chain/calculation-manager/providers/common/models/fee-info';

export class CbridgeCrossChainProvider extends CrossChainProvider {
    public readonly type = CROSS_CHAIN_TRADE_TYPE.CELER;

    private readonly apiService = new CbridgeCrossChainApiService();

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

            const contractAddress = await this.fetchContractAddressAndCheckTokens(
                fromToken,
                toToken
            );

            const feeInfo = await this.getFeeInfo(fromBlockchain, options.providerAddress);
            const fromWithoutFee = getFromWithoutFee(
                fromToken,
                feeInfo.rubicProxy?.platformFee?.percent
            );

            const { amount, maxSlippage } = await this.getEstimates(
                fromWithoutFee,
                toToken,
                options
            );

            const to = new PriceTokenAmount({
                ...toToken.asStruct,
                tokenAmount: Web3Pure.fromWei(amount, toToken.decimals)
            });

            const gasData =
                options.gasCalculation === 'enabled'
                    ? await CbridgeCrossChainTrade.getGasData(fromToken, to)
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
                        contractAddress
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
    ): Promise<string> {
        const config = await CbridgeCrossChainApiService.getTransferConfigs();

        const fromChainId = blockchainId[fromToken.blockchain];
        const toChainId = blockchainId[toToken.blockchain];
        if (
            !config.chains.some(chain => chain.id === fromChainId) ||
            !config.chains.some(chain => chain.id === toChainId)
        ) {
            throw new RubicSdkError('Not supported chain');
        }

        const supportedFromToken = config.chain_token?.[fromChainId]?.token.find(el =>
            compareAddresses(el.token.address, fromToken.address)
        );
        if (!supportedFromToken) {
            throw new RubicSdkError(`Source token ${fromToken.symbol} is not supported.`);
        }

        const supportedToToken = config.chain_token?.[toChainId]?.token.find(el =>
            compareAddresses(el.token.address, toToken.address)
        );
        if (!supportedToToken) {
            throw new RubicSdkError(`Source token ${toToken.symbol} is not supported.`);
        }

        return config.chains.find(chain => chain.id === fromChainId)!.contract_addr;
    }

    private async getEstimates(
        fromToken: PriceTokenAmount<EvmBlockchainName>,
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
}
