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
import { CHAIN_TYPE } from 'src/core/blockchain/models/chain-type';
import { BlockchainsInfo } from 'src/core/blockchain/utils/blockchains-info/blockchains-info';
import { blockchainId } from 'src/core/blockchain/utils/blockchains-info/constants/blockchain-id';
import { Web3PrivateSupportedBlockchain } from 'src/core/blockchain/web3-private-service/models/web-private-supported-blockchain';
import { Web3PublicSupportedBlockchain } from 'src/core/blockchain/web3-public-service/models/web3-public-storage';
import { Web3Pure } from 'src/core/blockchain/web3-pure/web3-pure';
import {
    FAKE_BITCOIN_ADDRESS,
    FAKE_TRON_WALLET_ADDRESS,
    FAKE_WALLET_ADDRESS
} from 'src/features/common/constants/fake-wallet-address';
import { SymbiosisApiService } from 'src/features/common/providers/symbiosis/services/symbiosis-api-service';
import { getFromWithoutFee } from 'src/features/common/utils/get-from-without-fee';
import { RequiredCrossChainOptions } from 'src/features/cross-chain/calculation-manager/models/cross-chain-options';
import { CROSS_CHAIN_TRADE_TYPE } from 'src/features/cross-chain/calculation-manager/models/cross-chain-trade-type';
import { CrossChainProvider } from 'src/features/cross-chain/calculation-manager/providers/common/cross-chain-provider';
import { CalculationResult } from 'src/features/cross-chain/calculation-manager/providers/common/models/calculation-result';
import { FeeInfo } from 'src/features/cross-chain/calculation-manager/providers/common/models/fee-info';
import { RubicStep } from 'src/features/cross-chain/calculation-manager/providers/common/models/rubicStep';
import { ProxyCrossChainEvmTrade } from 'src/features/cross-chain/calculation-manager/providers/common/proxy-cross-chain-evm-facade/proxy-cross-chain-evm-trade';
import { SymbiosisCcrBitcoinTrade } from 'src/features/cross-chain/calculation-manager/providers/symbiosis-provider/chain-trades/symbiosis-ccr-bitcoin-trade';
import { SymbiosisEvmCcrTrade } from 'src/features/cross-chain/calculation-manager/providers/symbiosis-provider/chain-trades/symbiosis-ccr-evm-trade';
import { SymbiosisCcrTonTrade } from 'src/features/cross-chain/calculation-manager/providers/symbiosis-provider/chain-trades/symbiosis-ccr-ton-trade';
import { SymbiosisTronCcrTrade } from 'src/features/cross-chain/calculation-manager/providers/symbiosis-provider/chain-trades/symbiosis-ccr-tron-trade';
import { SymbiosisError } from 'src/features/cross-chain/calculation-manager/providers/symbiosis-provider/models/symbiosis-error';
import { SymbiosisSwappingParams } from 'src/features/cross-chain/calculation-manager/providers/symbiosis-provider/models/symbiosis-swapping-params';
import {
    SymbiosisToken,
    SymbiosisTokenAmount
} from 'src/features/cross-chain/calculation-manager/providers/symbiosis-provider/models/symbiosis-trade-data';
import { SymbiosisCrossChainFactory } from 'src/features/cross-chain/calculation-manager/providers/symbiosis-provider/symbiosis-cross-chain-factory';
import { SymbiosisUtils } from 'src/features/cross-chain/calculation-manager/providers/symbiosis-provider/symbiosis-utils';
import { ON_CHAIN_TRADE_TYPE } from 'src/features/on-chain/calculation-manager/providers/common/models/on-chain-trade-type';

import {
    SymbiosisCrossChainSupportedBlockchain,
    symbiosisCrossChainSupportedBlockchains
} from './models/symbiosis-cross-chain-supported-blockchains';

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

        let disabledTrade = {} as
            | SymbiosisCcrTonTrade
            | SymbiosisEvmCcrTrade
            | SymbiosisTronCcrTrade
            | SymbiosisCcrBitcoinTrade;

        try {
            const fromAddress =
                options.fromAddress ||
                this.getWalletAddress(fromBlockchain as Web3PrivateSupportedBlockchain) ||
                this.getFakeAddress(fromBlockchain);

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
                chainId: SymbiosisUtils.getChainId(from),
                address: this.getTokenAddress(from),
                decimals: from.decimals,
                isNative: from.isNative,
                symbol: from.symbol
            };

            const tokenOut: SymbiosisToken = {
                chainId: SymbiosisUtils.getChainId(toToken),
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

            return {
                trade: SymbiosisCrossChainFactory.createTrade(
                    fromBlockchain,
                    {
                        from,
                        to,
                        gasData: await this.getGasData(from),
                        priceImpact: from.calculatePriceImpactPercent(to),
                        slippage: options.slippageTolerance,
                        swapParams,
                        feeInfo,
                        transitAmount: from.tokenAmount,
                        tradeType: { in: inTradeType, out: outTradeType },
                        contractAddresses: {
                            providerRouter: 'to' in tx ? tx.to! : '',
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
        const toType = BlockchainsInfo.getChainType(toBlockchain);

        if (toType === CHAIN_TYPE.EVM && !receiverAddress) {
            return FAKE_WALLET_ADDRESS;
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
    ):
        | SymbiosisEvmCcrTrade
        | SymbiosisCcrTonTrade
        | SymbiosisTronCcrTrade
        | SymbiosisCcrBitcoinTrade {
        return SymbiosisCrossChainFactory.createTrade(
            from.blockchain,
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
            // Native BTC to sBTC
            if (token.blockchain === BLOCKCHAIN_NAME.BITCOIN) {
                return '0xc102C66D4a1e1865Ee962084626Cf4c27D5BFc74';
            }
            // Native TON to sTON
            if (token.isNative && token.blockchain === BLOCKCHAIN_NAME.TON) {
                return '0xA4f1b5C2fC9b97d4238B3dE3487ccaE2c36dE07C';
            }
        }
        // TON USDT to sUSDT
        if (
            token.blockchain === BLOCKCHAIN_NAME.TON &&
            compareAddresses(token.address, 'EQCxE6mUtQJKFnGfaROTKOt1lZbDiiX1kCixRv7Nw2Id_sDs')
        ) {
            return '0x9328Eb759596C38a25f59028B146Fecdc3621Dfe';
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

    private getFakeAddress(fromBlockchain: BlockchainName): string {
        const chainType = BlockchainsInfo.getChainType(fromBlockchain);
        if (chainType === CHAIN_TYPE.EVM) {
            return FAKE_WALLET_ADDRESS;
        }
        if (chainType === CHAIN_TYPE.TON) {
            return 'UQATSC4TXAqjgLswuSEDVTIGmPG_kNnUTDhrTiIILVmymoQA';
        }
        if (chainType === CHAIN_TYPE.TRON) {
            return FAKE_TRON_WALLET_ADDRESS;
        }

        if (chainType === CHAIN_TYPE.BITCOIN) {
            return FAKE_BITCOIN_ADDRESS;
        }
        throw new Error('Blockchain not supported');
    }
}
