import { ethers } from 'ethers';
import { NotSupportedBlockchain, NotSupportedTokensError, RubicSdkError } from 'src/common/errors';
import { PriceToken, PriceTokenAmount } from 'src/common/tokens';
import { parseError } from 'src/common/utils/errors';
import {
    BLOCKCHAIN_NAME,
    BlockchainName,
    EvmBlockchainName
} from 'src/core/blockchain/models/blockchain-name';
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
import { stargateV2ContractAddress } from './constants/stargate-v2-contract-address';
import {
    StargateV2SupportedBlockchains,
    stargateV2SupportedBlockchains
} from './constants/stargate-v2-cross-chain-supported-blockchains';
import { stargateV2PoolAbi } from './constants/stargate-v2-pool-abi';
import { stargateV2PoolId } from './constants/stargate-v2-pool-id';
import {
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
        if (!this.isSupportedBlockchain(from.blockchain)) {
            throw new NotSupportedBlockchain();
        }
        try {
            const toBlockchain = toToken.blockchain as StargateV2SupportedBlockchains;
            const useProxy = false;

            const fromSymbol = StargateV2CrossChainProvider.getSymbol(
                from.symbol,
                from.blockchain
            ) as StargateV2BridgeToken;

            const isSupportedPools = this.checkSupportedPools(from, toToken);
            if (!isSupportedPools) {
                return {
                    trade: null,
                    error: new NotSupportedTokensError(),
                    tradeType: this.type
                };
            }
            const dstChainId = stargateV2ChainIds[toBlockchain];

            const feeInfo = await this.getFeeInfo(
                from.blockchain,
                options.providerAddress,
                from,
                useProxy
            );
            const fromAddress = options?.fromAddress || FAKE_WALLET_ADDRESS;

            const fromWithoutFee = getFromWithoutFee(
                from,
                feeInfo.rubicProxy?.platformFee?.percent
            );
            const amountLD = fromWithoutFee.stringWeiAmount;
            const sendParams: StargateV2QuoteParamsStruct = {
                dstEid: dstChainId,
                to: ethers.utils.hexZeroPad(fromAddress, 32),
                amountLD: amountLD,
                minAmountLD: amountLD,
                extraOptions: '0x',
                composeMsg: '0x',
                oftCmd: 0
            };

            const { amountReceivedLD } = await this.getReceiveAmount(
                sendParams,
                from.blockchain,
                fromSymbol
            );
            const amountReceived = amountReceivedLD[1] as string;
            sendParams.minAmountLD = amountReceived;

            const to = new PriceTokenAmount({
                ...toToken.asStruct,
                tokenAmount: Web3Pure.fromWei(amountReceived, toToken.decimals)
            });

            const routePath = await this.getRoutePath(from, to);
            const gasData =
                options.gasCalculation === 'enabled'
                    ? await StargateV2CrossChainTrade.getGasData(
                          from,
                          to,
                          feeInfo,
                          options.slippageTolerance,
                          options.providerAddress,
                          routePath,
                          sendParams,
                          options.receiverAddress
                      )
                    : null;
            return {
                trade: new StargateV2CrossChainTrade(
                    {
                        from,
                        to,
                        feeInfo,
                        slippageTolerance: options.slippageTolerance,
                        gasData,
                        priceImpact: from.calculatePriceImpactPercent(to),
                        sendParams
                    },
                    options.providerAddress,
                    routePath
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

    public static getSymbol(symbol: string, blockchain: BlockchainName): string {
        if (blockchain === BLOCKCHAIN_NAME.METIS && symbol.toLowerCase() === 'usdt') {
            return 'm.USDT';
        }
        if (blockchain === BLOCKCHAIN_NAME.METIS && symbol.toLowerCase() === 'eth') {
            return 'WETH';
        }
        if (blockchain === BLOCKCHAIN_NAME.SCROLL && symbol.toLowerCase() === 'usdc') {
            return 'USDC.e';
        }
        return symbol;
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
        const fromTokenSymbol = StargateV2CrossChainProvider.getSymbol(
            from.symbol,
            from.blockchain
        ) as StargateV2BridgeToken;
        const toTokenSymbol = StargateV2CrossChainProvider.getSymbol(
            to.symbol,
            to.blockchain
        ) as StargateV2BridgeToken;
        const srcTokenPool = stargateV2PoolId[fromTokenSymbol];
        const dstTokenPool = stargateV2PoolId[toTokenSymbol];
        const srcSupportedPools =
            stargateV2BlockchainSupportedPools[from.blockchain as StargateV2SupportedBlockchains];
        const dstSupportedPools =
            stargateV2BlockchainSupportedPools[to.blockchain as StargateV2SupportedBlockchains];

        if (
            srcSupportedPools.includes(srcTokenPool) &&
            dstSupportedPools.includes(dstTokenPool) &&
            srcTokenPool === dstTokenPool
        ) {
            return true;
        }
        return false;
    }

    private async getReceiveAmount(
        sendParam: StargateV2QuoteParamsStruct,
        fromBlockchain: EvmBlockchainName,
        tokenSymbol: StargateV2BridgeToken
    ): Promise<StargateV2QuoteOFTResponse> {
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
}
