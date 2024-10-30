import BigNumber from 'bignumber.js';
import { MaxAmountError, MinAmountError, RubicSdkError } from 'src/common/errors';
import { NoLinkedAccountError } from 'src/common/errors/swap/no-linked-account-erros';
import { PriceToken, PriceTokenAmount, TokenAmount as RubicTokenAmount } from 'src/common/tokens';
import { compareAddresses } from 'src/common/utils/blockchain';
import {
    BLOCKCHAIN_NAME,
    BlockchainName,
    EvmBlockchainName
} from 'src/core/blockchain/models/blockchain-name';
import { BlockchainsInfo } from 'src/core/blockchain/utils/blockchains-info/blockchains-info';
import { blockchainId } from 'src/core/blockchain/utils/blockchains-info/constants/blockchain-id';
import { Web3PrivateSupportedBlockchain } from 'src/core/blockchain/web3-private-service/models/web-private-supported-blockchain';
import { Web3PublicSupportedBlockchain } from 'src/core/blockchain/web3-public-service/models/web3-public-storage';
import { Web3Pure } from 'src/core/blockchain/web3-pure/web3-pure';
import { SymbiosisApiService } from 'src/features/common/providers/symbiosis/services/symbiosis-api-service';
import { getFromWithoutFee } from 'src/features/common/utils/get-from-without-fee';
import { RequiredCrossChainOptions } from 'src/features/cross-chain/calculation-manager/models/cross-chain-options';
import { CROSS_CHAIN_TRADE_TYPE } from 'src/features/cross-chain/calculation-manager/models/cross-chain-trade-type';
import { CrossChainProvider } from 'src/features/cross-chain/calculation-manager/providers/common/cross-chain-provider';
import { CalculationResult } from 'src/features/cross-chain/calculation-manager/providers/common/models/calculation-result';
import { FeeInfo } from 'src/features/cross-chain/calculation-manager/providers/common/models/fee-info';
import { RubicStep } from 'src/features/cross-chain/calculation-manager/providers/common/models/rubicStep';
import { ProxyCrossChainEvmTrade } from 'src/features/cross-chain/calculation-manager/providers/common/proxy-cross-chain-evm-facade/proxy-cross-chain-evm-trade';
import { SymbiosisError } from 'src/features/cross-chain/calculation-manager/providers/symbiosis-provider/models/symbiosis-error';
import { SymbiosisSwappingParams } from 'src/features/cross-chain/calculation-manager/providers/symbiosis-provider/models/symbiosis-swapping-params';
import {
    SymbiosisToken,
    SymbiosisTokenAmount
} from 'src/features/cross-chain/calculation-manager/providers/symbiosis-provider/models/symbiosis-trade-data';
import { ON_CHAIN_TRADE_TYPE } from 'src/features/on-chain/calculation-manager/providers/common/models/on-chain-trade-type';

import {
    SymbiosisCrossChainSupportedBlockchain,
    symbiosisCrossChainSupportedBlockchains
} from './models/symbiosis-cross-chain-supported-blockchains';
import { SymbiosisEvmCcrTrade } from './symbiosis-ccr-evm-trade';

export class SymbiosisCrossChainProvider extends CrossChainProvider {
    public readonly type = CROSS_CHAIN_TRADE_TYPE.SYMBIOSIS;

    public isSupportedBlockchain(
        blockchain: BlockchainName
    ): blockchain is SymbiosisCrossChainSupportedBlockchain {
        return symbiosisCrossChainSupportedBlockchains.some(
            supportedBlockchain => supportedBlockchain === blockchain
        );
    }

    public override areSupportedBlockchains(
        fromBlockchain: BlockchainName,
        toBlockchain: BlockchainName
    ): boolean {
        if (
            fromBlockchain === BLOCKCHAIN_NAME.BITCOIN ||
            fromBlockchain === BLOCKCHAIN_NAME.TON ||
            fromBlockchain === BLOCKCHAIN_NAME.TRON
        ) {
            return false;
        }

        return super.areSupportedBlockchains(fromBlockchain, toBlockchain);
    }

    // eslint-disable-next-line complexity
    public async calculate(
        from: PriceTokenAmount<EvmBlockchainName>,
        toToken: PriceToken,
        options: RequiredCrossChainOptions
    ): Promise<CalculationResult> {
        const fromBlockchain = from.blockchain as SymbiosisCrossChainSupportedBlockchain;
        const toBlockchain = toToken.blockchain as SymbiosisCrossChainSupportedBlockchain;
        // @TODO remove after gas fix for metis
        const useProxy =
            from.blockchain === BLOCKCHAIN_NAME.METIS
                ? false
                : options?.useProxy?.[this.type] ?? true;

        let disabledTrade = {} as SymbiosisEvmCcrTrade;

        try {
            const FAKE_WALLET_ADDRESS = '0xf78312D6aD7afc364422Dda14a24082104588542';
            const fromAddress =
                options.fromAddress ||
                this.getWalletAddress(fromBlockchain as Web3PrivateSupportedBlockchain) ||
                FAKE_WALLET_ADDRESS;

            const feeInfo = await this.getFeeInfo(
                fromBlockchain,
                options.providerAddress,
                from,
                useProxy
            );
            const fromWithoutFee = getFromWithoutFee(
                from,
                feeInfo.rubicProxy?.platformFee?.percent
            );

            const tokenIn: SymbiosisToken = {
                chainId: this.getChainId(from),
                address: this.getTokenAddress(from),
                decimals: from.decimals,
                isNative: from.isNative,
                symbol: from.symbol
            };

            const tokenOut: SymbiosisToken = {
                chainId: this.getChainId(toToken),
                address: this.getTokenAddress(toToken),
                decimals: toToken.decimals,
                isNative: toToken.isNative,
                symbol: toToken.symbol
            };

            const symbiosisTokenAmountIn: SymbiosisTokenAmount = {
                ...tokenIn,
                amount: fromWithoutFee.stringWeiAmount
            };

            const deadline = Math.floor(Date.now() / 1000) + 60 * options.deadline;
            const slippageTolerance = options.slippageTolerance * 10000;

            const swapParams: SymbiosisSwappingParams = {
                tokenAmountIn: symbiosisTokenAmountIn,
                tokenOut,
                from: fromAddress,
                to: this.getSwapParamsToAddress(options.receiverAddress, fromAddress, toBlockchain),
                revertableAddress: fromAddress,
                slippage: slippageTolerance,
                deadline
            };

            const mockTo = new PriceTokenAmount({
                ...toToken.asStruct,
                tokenAmount: Web3Pure.fromWei(0, toToken.decimals)
            });

            disabledTrade = this.getEmptyTrade(from, mockTo, swapParams, feeInfo);

            try {
                await this.checkTokenLimits(tokenIn, from);
            } catch (err) {
                if (err instanceof MinAmountError || err instanceof MaxAmountError) {
                    return {
                        error: err,
                        trade: disabledTrade,
                        tradeType: this.type
                    };
                }
            }

            const { rewards, tokenAmountOut, inTradeType, outTradeType, tx, approveTo, route } =
                await SymbiosisApiService.getCrossChainSwapTx(swapParams);

            const to = new PriceTokenAmount({
                ...toToken.asStruct,
                tokenAmount: Web3Pure.fromWei(tokenAmountOut.amount, tokenAmountOut.decimals)
            });

            const gasData =
                options.gasCalculation === 'enabled'
                    ? await SymbiosisEvmCcrTrade.getGasData(
                          from,
                          to,
                          swapParams,
                          feeInfo,
                          approveTo,
                          options.providerAddress,
                          options.receiverAddress
                      )
                    : null;

            return {
                trade: new SymbiosisEvmCcrTrade(
                    {
                        from,
                        to,
                        gasData,
                        priceImpact: from.calculatePriceImpactPercent(to),
                        slippage: options.slippageTolerance,
                        swapParams,
                        feeInfo,
                        transitAmount: from.tokenAmount,
                        tradeType: { in: inTradeType, out: outTradeType },
                        contractAddresses: {
                            providerRouter: tx.to!,
                            providerGateway: approveTo
                        },
                        ...(rewards?.length && { promotions: this.getPromotions(rewards) })
                    },
                    options.providerAddress,
                    await this.getRoutePath(from, to, route),
                    useProxy
                ),
                tradeType: this.type
            };
        } catch (err) {
            let rubicSdkError = CrossChainProvider.parseError(err);
            const symbiosisErr = err as SymbiosisError;
            const symbiosisSdkError = this.handleMinAmountError(symbiosisErr);
            if (
                err?.error?.message.includes(
                    'estimateGas: execution reverted: TransferHelper::safeTransfer: transfer failed'
                )
            ) {
                rubicSdkError = new NoLinkedAccountError();
            }
            return {
                trade: symbiosisSdkError ? disabledTrade : null,
                error: symbiosisSdkError || rubicSdkError,
                tradeType: this.type
            };
        }
    }

    private getPromotions(rewards: SymbiosisTokenAmount[]): string[] {
        return rewards.map(
            promo => `${promo.symbol}_${Web3Pure.fromWei(promo.amount, promo.decimals).toFixed()}`
        );
    }

    private getChainId(token: PriceToken): number {
        if (BlockchainsInfo.isTonBlockchainName(token.blockchain)) {
            return 8888888;
        }
        if (BlockchainsInfo.isTronBlockchainName(token.blockchain)) {
            return 728126428;
        }
        if (BlockchainsInfo.isBitcoinBlockchainName(token.blockchain)) {
            return 3652501241;
        }
        return blockchainId[token.blockchain];
    }

    protected async getFeeInfo(
        fromBlockchain: SymbiosisCrossChainSupportedBlockchain,
        providerAddress: string,
        percentFeeToken: PriceTokenAmount,
        useProxy: boolean
    ): Promise<FeeInfo> {
        return ProxyCrossChainEvmTrade.getFeeInfo(
            fromBlockchain as Web3PublicSupportedBlockchain,
            providerAddress,
            percentFeeToken,
            useProxy
        );
    }

    protected async getRoutePath(
        fromToken: PriceTokenAmount,
        toToken: PriceTokenAmount,
        route: SymbiosisToken[]
    ): Promise<RubicStep[]> {
        const fromChainId = blockchainId[fromToken.blockchain];
        const toChainId = blockchainId[toToken.blockchain];

        const transitFrom = [...route].reverse().find(el => el.chainId === fromChainId);
        const transitTo = route.find(el => el.chainId === toChainId);

        const fromTokenAmount = transitFrom
            ? await RubicTokenAmount.createToken({
                  blockchain: fromToken.blockchain,
                  address: transitFrom.address,
                  weiAmount: new BigNumber(0)
              })
            : fromToken;

        const toTokenAmount = transitTo
            ? await RubicTokenAmount.createToken({
                  blockchain: toToken.blockchain,
                  address: transitTo.address,
                  weiAmount: new BigNumber(0)
              })
            : toToken;

        const routePath: RubicStep[] = [];

        if (transitFrom) {
            routePath.push({
                type: 'on-chain',
                provider: ON_CHAIN_TRADE_TYPE.SYMBIOSIS_SWAP,
                path: [fromToken, fromTokenAmount]
            });
        }
        routePath.push({
            type: 'cross-chain',
            provider: CROSS_CHAIN_TRADE_TYPE.SYMBIOSIS,
            path: [fromTokenAmount, toTokenAmount]
        });
        if (transitTo) {
            routePath.push({
                type: 'on-chain',
                provider: ON_CHAIN_TRADE_TYPE.SYMBIOSIS_SWAP,
                path: [toTokenAmount, toToken]
            });
        }
        return routePath;
    }

    private getSwapParamsToAddress(
        receiverAddress: string | undefined,
        fromAddress: string,
        toBlockchain: BlockchainName
    ): string {
        if (toBlockchain === BLOCKCHAIN_NAME.BITCOIN && !receiverAddress) {
            return 'bc1qvyf8ufqpeyfe6vshfxdrr970rkqfphgz28ulhr';
        }
        // @TODO add rubic-mock address
        if (toBlockchain === BLOCKCHAIN_NAME.TON && !receiverAddress) {
            return 'UQATSC4TXAqjgLswuSEDVTIGmPG_kNnUTDhrTiIILVmymoQA';
        }

        return receiverAddress || fromAddress;
    }

    private handleMinAmountError(err: SymbiosisError): RubicSdkError | null {
        const msg = err.error?.message || '';

        if (msg.includes('too low')) {
            const [, minAmount] = msg.toLowerCase().split('min: ') as [string, string];
            const minAmountBN = new BigNumber(parseFloat(minAmount));
            const isFeeInUSDC = minAmountBN.gt(0.5);
            const symbol = isFeeInUSDC ? 'USDC' : 'WETH';

            return new MinAmountError(minAmountBN, symbol);
        }

        return null;
    }

    private getEmptyTrade(
        from: PriceTokenAmount<EvmBlockchainName>,
        to: PriceTokenAmount<BlockchainName>,
        swapParams: SymbiosisSwappingParams,
        feeInfo: FeeInfo
    ): SymbiosisEvmCcrTrade {
        return new SymbiosisEvmCcrTrade(
            {
                from,
                to: to,
                gasData: null,
                priceImpact: null,
                slippage: 0,
                swapParams,
                feeInfo,
                transitAmount: from.tokenAmount,
                tradeType: { in: undefined, out: undefined },
                contractAddresses: {
                    providerRouter: '',
                    providerGateway: ''
                }
            },
            '',
            [
                {
                    type: 'cross-chain',
                    provider: CROSS_CHAIN_TRADE_TYPE.SYMBIOSIS,
                    path: [from, to]
                }
            ],
            true
        );
    }

    private getTokenAddress(token: RubicTokenAmount | PriceToken) {
        if (token.isNative) {
            if (token.blockchain === BLOCKCHAIN_NAME.METIS) {
                return '0xdeaddeaddeaddeaddeaddeaddeaddeaddead0000';
            }
            if (token.blockchain === BLOCKCHAIN_NAME.BITCOIN) {
                return '0xc102C66D4a1e1865Ee962084626Cf4c27D5BFc74';
            }
            return '';
        }
        return token.address;
    }

    private async checkTokenLimits(
        tokenIn: SymbiosisToken,
        from: PriceTokenAmount
    ): Promise<void | never> {
        const tokenLimits = await SymbiosisApiService.getTokenLimits();

        const token = tokenLimits.find(
            token =>
                compareAddresses(token.address, tokenIn.address) &&
                token.chainId === tokenIn.chainId
        );

        if (token) {
            const minAmountBN = Web3Pure.fromWei(token.min, from.decimals);
            const maxAmountBN = Web3Pure.fromWei(token.max, from.decimals);

            if (from.tokenAmount.lt(minAmountBN)) {
                throw new MinAmountError(minAmountBN, from.symbol);
            }

            if (from.tokenAmount.gt(maxAmountBN)) {
                throw new MaxAmountError(maxAmountBN, from.symbol);
            }
        }
    }
}
