import BigNumber from 'bignumber.js';
import { RubicSdkError } from 'src/common/errors';
import { PriceToken, PriceTokenAmount } from 'src/common/tokens';
import { nativeTokensList } from 'src/common/tokens/constants/native-tokens';
import { parseError } from 'src/common/utils/errors';
import { BlockchainName, EvmBlockchainName } from 'src/core/blockchain/models/blockchain-name';
import { CHAIN_TYPE } from 'src/core/blockchain/models/chain-type';
import { EvmWeb3Pure } from 'src/core/blockchain/web3-pure/typed-web3-pure/evm-web3-pure/evm-web3-pure';
import { Web3Pure } from 'src/core/blockchain/web3-pure/web3-pure';
import { Injector } from 'src/core/injector/injector';
import { RequiredCrossChainOptions } from 'src/features/cross-chain/calculation-manager/models/cross-chain-options';
import { CROSS_CHAIN_TRADE_TYPE } from 'src/features/cross-chain/calculation-manager/models/cross-chain-trade-type';
import { CrossChainProvider } from 'src/features/cross-chain/calculation-manager/providers/common/cross-chain-provider';
import { CalculationResult } from 'src/features/cross-chain/calculation-manager/providers/common/models/calculation-result';
import { FeeInfo } from 'src/features/cross-chain/calculation-manager/providers/common/models/fee-info';
import { feeLibraryAbi } from 'src/features/cross-chain/calculation-manager/providers/stargate-provider/constants/fee-library-abi';
import { stargateFeeLibraryContractAddress } from 'src/features/cross-chain/calculation-manager/providers/stargate-provider/constants/stargate-fee-library-contract-address';

import { stargateBlockchainSupportedPools } from './constants/stargate-blockchain-supported-pool';
import { stargateChainId } from './constants/stargate-chain-id';
import { stargateContractAddress } from './constants/stargate-contract-address';
import {
    StargateCrossChainSupportedBlockchain,
    stargateCrossChainSupportedBlockchains
} from './constants/stargate-cross-chain-supported-blockchain';
import { StargateBridgeToken, stargatePoolId } from './constants/stargate-pool-id';
import { stargateRouterAbi } from './constants/stargate-router-abi';
import { StargateCrossChainTrade } from './stargate-cross-chain-trade';

export class StargateCrossChainProvider extends CrossChainProvider {
    public readonly type = CROSS_CHAIN_TRADE_TYPE.STARGATE;

    public isSupportedBlockchain(
        blockchain: BlockchainName
    ): blockchain is StargateCrossChainSupportedBlockchain {
        return stargateCrossChainSupportedBlockchains.some(
            supportedBlockchain => supportedBlockchain === blockchain
        );
    }

    private checkIsSupportedTokens(
        from: PriceTokenAmount<EvmBlockchainName>,
        to: PriceToken<EvmBlockchainName>
    ): void {
        const fromBlockchain = from.blockchain as StargateCrossChainSupportedBlockchain;
        const toBlockchain = to.blockchain as StargateCrossChainSupportedBlockchain;
        const srcPoolId = stargatePoolId[from.symbol as StargateBridgeToken];
        const dstPoolId = stargatePoolId[to.symbol as StargateBridgeToken];
        const srcSupportedPools = stargateBlockchainSupportedPools[fromBlockchain];
        const dstSupportedPools = stargateBlockchainSupportedPools[toBlockchain];

        if (
            !(
                srcPoolId === dstPoolId &&
                srcSupportedPools.includes(srcPoolId) &&
                dstSupportedPools.includes(dstPoolId)
            )
        ) {
            throw new RubicSdkError('Unsupported token pair');
        }
    }

    public async calculate(
        from: PriceTokenAmount<EvmBlockchainName>,
        toToken: PriceToken<EvmBlockchainName>,
        options: RequiredCrossChainOptions
    ): Promise<CalculationResult> {
        try {
            const fromBlockchain = from.blockchain as StargateCrossChainSupportedBlockchain;
            const toBlockchain = toToken.blockchain as StargateCrossChainSupportedBlockchain;

            if (!this.areSupportedBlockchains(fromBlockchain, toBlockchain)) {
                return null;
            }
            await this.checkEqFee(from, toToken);
            this.checkIsSupportedTokens(from, toToken);

            const amountOutMin = from.tokenAmount.multipliedBy(1 - options.slippageTolerance);
            const to = new PriceTokenAmount({
                ...toToken.asStruct,
                tokenAmount: amountOutMin
            });
            const feeInfo = await this.getFeeInfo(fromBlockchain, options.providerAddress);

            const layerZeroFeeWei = await this.getLayerZeroFee(from, to, amountOutMin);
            const layerZeroFeeAmount = Web3Pure.fromWei(
                layerZeroFeeWei,
                nativeTokensList[fromBlockchain].decimals
            );
            feeInfo.provider = {
                cryptoFee: {
                    amount: layerZeroFeeAmount,
                    tokenSymbol: nativeTokensList[fromBlockchain].symbol
                }
            };

            return {
                trade: new StargateCrossChainTrade(
                    {
                        from,
                        to,
                        toTokenAmountMin: amountOutMin,
                        slippageTolerance: options.slippageTolerance,
                        priceImpact: null,
                        gasData: null,
                        feeInfo
                    },
                    options.providerAddress
                )
            };
        } catch (error) {
            console.error({ 'CALCULATE ERROR': error });
            return {
                trade: null,
                error: parseError(error)
            };
        }
    }

    private async getLayerZeroFee(
        from: PriceTokenAmount<EvmBlockchainName>,
        to: PriceTokenAmount<EvmBlockchainName>,
        amountOutMin: BigNumber
    ): Promise<BigNumber> {
        const layzerZeroTxData = await StargateCrossChainTrade.getLayerZeroSwapData(
            from,
            to,
            amountOutMin
        );
        const web3Public = Injector.web3PublicService.getWeb3Public(from.blockchain);
        const walletAddress = Injector.web3PrivateService.getWeb3Private(CHAIN_TYPE.EVM).address;
        const layerZeroFee = await web3Public.callContractMethod(
            stargateContractAddress[from.blockchain as StargateCrossChainSupportedBlockchain],
            stargateRouterAbi,
            'quoteLayerZeroFee',
            [
                stargateChainId[to.blockchain as StargateCrossChainSupportedBlockchain],
                1,
                walletAddress || EvmWeb3Pure.EMPTY_ADDRESS,
                layzerZeroTxData.data,
                ['0', '0', walletAddress || EvmWeb3Pure.EMPTY_ADDRESS]
            ]
        );
        return new BigNumber(`${layerZeroFee['0']!}`);
    }

    protected async getFeeInfo(
        fromBlockchain: Partial<EvmBlockchainName>,
        _providerAddress: string
    ): Promise<FeeInfo> {
        return {
            rubicProxy: {
                fixedFee: {
                    // amount: await this.getFixedFee(
                    //     fromBlockchain,
                    //     providerAddress,
                    //     RANGO_CONTRACT_ADDRESSES[
                    //         fromBlockchain as RangoCrossChainSupportedBlockchain
                    //     ].rubicRouter,
                    //     evmCommonCrossChainAbi
                    // ),
                    amount: new BigNumber(0),
                    tokenSymbol: nativeTokensList[fromBlockchain].symbol
                },
                platformFee: {
                    // percent: await this.getFeePercent(
                    //     fromBlockchain,
                    //     providerAddress,
                    //     RANGO_CONTRACT_ADDRESSES[
                    //         fromBlockchain as RangoCrossChainSupportedBlockchain
                    //     ].rubicRouter,
                    //     evmCommonCrossChainAbi
                    // ),
                    percent: 0,
                    tokenSymbol: 'USDC'
                }
            }
        };
    }

    private async checkEqFee(
        fromToken: PriceTokenAmount<EvmBlockchainName>,
        toToken: PriceToken<EvmBlockchainName>
    ): Promise<void> {
        const fromBlockchain = fromToken.blockchain as StargateCrossChainSupportedBlockchain;
        const toBlockchain = toToken.blockchain as StargateCrossChainSupportedBlockchain;
        const srcPoolId = stargatePoolId[fromToken.symbol as StargateBridgeToken];
        const dstPoolId = stargatePoolId[toToken.symbol as StargateBridgeToken];
        const dstChainId = stargateChainId[toBlockchain as StargateCrossChainSupportedBlockchain];
        const amountSD = fromToken.stringWeiAmount;
        const whitelisted = false;
        const hasEqReward = false;

        const [, protocolSubsidy] = await Injector.web3PublicService
            .getWeb3Public(fromBlockchain)
            .callContractMethod<[string, string]>(
                stargateFeeLibraryContractAddress[fromBlockchain],
                feeLibraryAbi,
                'getEquilibriumFee',
                [srcPoolId, dstPoolId, dstChainId, amountSD, whitelisted, hasEqReward]
            );

        if (protocolSubsidy === '0') {
            throw new RubicSdkError('Rebalancing need detected.');
        }
    }
}
