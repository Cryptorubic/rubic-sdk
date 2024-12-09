import BigNumber from 'bignumber.js';
import { ethers } from 'ethers';
import { MaxAmountError, NotSupportedTokensError, RubicSdkError } from 'src/common/errors';
import { PriceToken, PriceTokenAmount } from 'src/common/tokens';
import { nativeTokensList } from 'src/common/tokens/constants/native-tokens';
import { parseError } from 'src/common/utils/errors';
import { BlockchainName, EvmBlockchainName } from 'src/core/blockchain/models/blockchain-name';
import { Web3Pure } from 'src/core/blockchain/web3-pure/web3-pure';
import { Injector } from 'src/core/injector/injector';
import { FAKE_WALLET_ADDRESS } from 'src/features/common/constants/fake-wallet-address';
import { getFromWithoutFee } from 'src/features/common/utils/get-from-without-fee';

import { RequiredCrossChainOptions } from '../../models/cross-chain-options';
import { CROSS_CHAIN_TRADE_TYPE } from '../../models/cross-chain-trade-type';
import { CrossChainProvider } from '../common/cross-chain-provider';
import { CalculationResult } from '../common/models/calculation-result';
import { FeeInfo } from '../common/models/fee-info';
import { RubicStep } from '../common/models/rubicStep';
import { ProxyCrossChainEvmTrade } from '../common/proxy-cross-chain-evm-facade/proxy-cross-chain-evm-trade';
import { stargateV2BlockchainSupportedPools } from './constants/stargate-v2-blockchain-supported-pools';
import { StargateV2BridgeToken } from './constants/stargate-v2-bridge-token';
import { stargateV2ChainIds } from './constants/stargate-v2-chain-id';
import {
    chainsWithoutPoolBalanceMethodOnContract,
    stargateV2ContractAddress
} from './constants/stargate-v2-contract-address';
import {
    StargateV2SupportedBlockchains,
    stargateV2SupportedBlockchains
} from './constants/stargate-v2-cross-chain-supported-blockchains';
import {
    stargateV2PoolAbi,
    stargateV2PoolBalanceAbi,
    stargateV2SendQuoteAbi
} from './constants/stargate-v2-pool-abi';
import { getTokenPoolByAddress } from './constants/stargate-v2-pool-id';
import { stargateV2TokenAddress } from './constants/stargate-v2-token-address';
import {
    StargateV2MessagingFee,
    StargateV2QuoteOFTResponse,
    StargateV2QuoteParamsStruct
} from './modal/stargate-v2-quote-params-struct';
import { StargateV2CrossChainTrade } from './stargate-v2-cross-chain-trade';

export class StargateV2CrossChainProvider extends CrossChainProvider {
    public readonly type = CROSS_CHAIN_TRADE_TYPE.STARGATE_V2;

    public isSupportedBlockchain(fromBlockchain: BlockchainName): boolean {
        return stargateV2SupportedBlockchains.some(
            supportedBlockchain => supportedBlockchain === fromBlockchain
        );
    }

    public async calculate(
        from: PriceTokenAmount<EvmBlockchainName>,
        toToken: PriceToken<EvmBlockchainName>,
        options: RequiredCrossChainOptions
    ): Promise<CalculationResult> {
        try {
            const isSupportedPools = this.checkSupportedPools(from, toToken);
            if (!isSupportedPools) {
                return {
                    trade: null,
                    error: new NotSupportedTokensError(),
                    tradeType: this.type
                };
            }

            const toBlockchain = toToken.blockchain as StargateV2SupportedBlockchains;
            const useProxy = options?.useProxy?.[this.type] ?? true;
            const fromTokenAddress = from.address.toLowerCase();

            const dstChainId = stargateV2ChainIds[toBlockchain];

            const feeInfo = await this.getFeeInfo(
                from.blockchain,
                options.providerAddress,
                from,
                useProxy
            );
            const receiverAddress =
                options?.receiverAddress ||
                this.getWalletAddress(from.blockchain) ||
                FAKE_WALLET_ADDRESS;

            const fromWithoutFee = getFromWithoutFee(
                from,
                feeInfo.rubicProxy?.platformFee?.percent
            );

            const maxAmountError = await this.checkMaxAmount(
                from.blockchain,
                fromTokenAddress,
                fromWithoutFee.weiAmount
            );

            if (maxAmountError) {
                return {
                    trade: null,
                    error: maxAmountError,
                    tradeType: this.type
                };
            }

            const amountLD = fromWithoutFee.stringWeiAmount;

            const sendParams: StargateV2QuoteParamsStruct = {
                dstEid: dstChainId,
                to: ethers.utils.hexZeroPad(receiverAddress, 32),
                amountLD: amountLD,
                minAmountLD: amountLD,
                extraOptions: '0x',
                composeMsg: '0x',
                oftCmd: '0x'
            };

            const { amountReceivedLD } = await this.getReceiveAmount(
                sendParams,
                from.blockchain,
                fromTokenAddress
            );
            const amountReceived = amountReceivedLD[1] as string;
            const slippageAmount = new BigNumber(amountReceived).multipliedBy(
                options.slippageTolerance
            );
            const minReceivedAmount = new BigNumber(amountReceived).minus(slippageAmount);
            sendParams.amountLD = amountReceived;
            sendParams.minAmountLD = minReceivedAmount.toFixed(0);
            const messagingFee = await this.getNativeFee(
                sendParams,
                from.blockchain,
                fromTokenAddress
            );
            const nativeToken = nativeTokensList[from.blockchain];

            const cryptoFeeToken = await PriceTokenAmount.createFromToken({
                ...nativeToken,
                weiAmount: new BigNumber(messagingFee.nativeFee)
            });

            const to = new PriceTokenAmount({
                ...toToken.asStruct,
                tokenAmount: Web3Pure.fromWei(amountReceived, fromWithoutFee.decimals)
            });

            const routePath = await this.getRoutePath(from, to);

            return {
                trade: new StargateV2CrossChainTrade(
                    {
                        from,
                        to,
                        feeInfo: {
                            ...feeInfo,
                            provider: {
                                cryptoFee: {
                                    amount: Web3Pure.fromWei(
                                        messagingFee.nativeFee,
                                        nativeToken.decimals
                                    ),
                                    token: cryptoFeeToken
                                }
                            }
                        },
                        slippageTolerance: options.slippageTolerance,
                        gasData: await this.getGasData(from),
                        sendParams,
                        messagingFee,
                        priceImpact: from.calculatePriceImpactPercent(to),
                        toTokenAmountMin: Web3Pure.fromWei(
                            minReceivedAmount,
                            fromWithoutFee.decimals
                        )
                    },
                    options.providerAddress,
                    routePath,
                    useProxy
                ),
                tradeType: this.type
            };
        } catch (err) {
            return {
                trade: null,
                error: parseError(err),
                tradeType: this.type
            };
        }
    }

    private async checkMaxAmount(
        fromBlockchain: EvmBlockchainName,
        tokenAddress: string,
        amountToSend: BigNumber
    ): Promise<MaxAmountError | null> {
        if (chainsWithoutPoolBalanceMethodOnContract.some(chain => chain === fromBlockchain)) {
            return null;
        }

        const tokenSymbol = stargateV2TokenAddress[
            fromBlockchain as StargateV2SupportedBlockchains
        ][tokenAddress] as StargateV2BridgeToken;
        const contractAddress = stargateV2ContractAddress[
            fromBlockchain as StargateV2SupportedBlockchains
        ][tokenSymbol] as string;

        const maxAmount = await Injector.web3PublicService
            .getWeb3Public(fromBlockchain)
            .callContractMethod(contractAddress, stargateV2PoolBalanceAbi, 'poolBalance')
            .catch(() => '0');
        const maxAmounSend = new BigNumber(maxAmount);

        if (amountToSend.gt(maxAmounSend)) {
            return new MaxAmountError(maxAmounSend, tokenSymbol as string);
        }
        return null;
    }

    protected async getFeeInfo(
        fromBlockchain: Partial<EvmBlockchainName>,
        providerAddress: string,
        percentFeeToken: PriceTokenAmount,
        useProxy: boolean
    ): Promise<FeeInfo> {
        return ProxyCrossChainEvmTrade.getFeeInfo(
            fromBlockchain,
            providerAddress,
            percentFeeToken,
            useProxy
        );
    }

    private checkSupportedPools(
        from: PriceTokenAmount<EvmBlockchainName>,
        to: PriceToken<EvmBlockchainName>
    ): boolean {
        const fromBlockchain = from.blockchain as StargateV2SupportedBlockchains;
        const toBlockchain = to.blockchain as StargateV2SupportedBlockchains;
        const srcTokenPool = getTokenPoolByAddress(fromBlockchain, from.address.toLowerCase());
        const dstTokenPool = getTokenPoolByAddress(toBlockchain, to.address.toLowerCase());

        if (!srcTokenPool || !dstTokenPool) {
            return false;
        }
        const srcSupportedPools =
            stargateV2BlockchainSupportedPools[from.blockchain as StargateV2SupportedBlockchains];
        const dstSupportedPools =
            stargateV2BlockchainSupportedPools[to.blockchain as StargateV2SupportedBlockchains];

        return (
            srcSupportedPools.includes(srcTokenPool) &&
            dstSupportedPools.includes(dstTokenPool) &&
            srcTokenPool === dstTokenPool
        );
    }

    private async getReceiveAmount(
        sendParam: StargateV2QuoteParamsStruct,
        fromBlockchain: EvmBlockchainName,
        tokenAddress: string
    ): Promise<StargateV2QuoteOFTResponse> {
        const tokenSymbol = stargateV2TokenAddress[
            fromBlockchain as StargateV2SupportedBlockchains
        ][tokenAddress] as StargateV2BridgeToken;

        const contractAddress = stargateV2ContractAddress[
            fromBlockchain as StargateV2SupportedBlockchains
        ][tokenSymbol] as string;

        try {
            const { 2: amountReceivedLD } = await Injector.web3PublicService
                .getWeb3Public(fromBlockchain)
                .callContractMethod<{ 2: string[] }>(
                    contractAddress,
                    stargateV2PoolAbi,
                    'quoteOFT',
                    [sendParam]
                );

            return {
                amountReceivedLD
            };
        } catch (err) {
            throw new RubicSdkError(err?.message);
        }
    }

    protected async getRoutePath(
        from: PriceTokenAmount,
        to: PriceTokenAmount
    ): Promise<RubicStep[]> {
        return [
            {
                type: 'cross-chain',
                provider: CROSS_CHAIN_TRADE_TYPE.STARGATE_V2,
                path: [from, to]
            }
        ];
    }

    private async getNativeFee(
        sendParam: StargateV2QuoteParamsStruct,
        fromBlockchain: EvmBlockchainName,
        tokenAddress: string
    ): Promise<StargateV2MessagingFee> {
        const tokenSymbol = stargateV2TokenAddress[
            fromBlockchain as StargateV2SupportedBlockchains
        ][tokenAddress] as StargateV2BridgeToken;
        const contractAddress = stargateV2ContractAddress[
            fromBlockchain as StargateV2SupportedBlockchains
        ][tokenSymbol] as string;
        try {
            const { 0: nativeFee, 1: lzTokenFee } = await Injector.web3PublicService
                .getWeb3Public(fromBlockchain)
                .callContractMethod<{ 0: string; 1: string }>(
                    contractAddress,
                    stargateV2SendQuoteAbi,
                    'quoteSend',
                    [sendParam, false]
                );
            return {
                nativeFee,
                lzTokenFee
            };
        } catch (err) {
            throw new RubicSdkError(err?.message);
        }
    }
}
