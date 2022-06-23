import { CrossChainTradeProvider } from '@features/cross-chain/providers/common/cross-chain-trade-provider';
import { CROSS_CHAIN_TRADE_TYPE, OneinchAbstractProvider } from 'src/features';
import { BLOCKCHAIN_NAME, BlockchainName, BlockchainsInfo, PriceToken, Web3Pure } from 'src/core';
import { RequiredCrossChainOptions } from '@features/cross-chain/models/cross-chain-options';

import {
    SymbiosisCrossChainSupportedBlockchain,
    symbiosisCrossChainSupportedBlockchains
} from '@features/cross-chain/providers/symbiosis-trade-provider/constants/symbiosis-cross-chain-supported-blockchain';
import { compareAddresses, CrossChainIsUnavailableError, RubicSdkError } from 'src/common';
import { Injector } from '@core/sdk/injector';
import {
    ErrorCode,
    Symbiosis,
    Token as SymbiosisToken,
    TokenAmount as SymbiosisTokenAmount,
    Error as SymbiosisError
} from 'symbiosis-js-sdk';
import BigNumber from 'bignumber.js';
import { SymbiosisCrossChainTrade } from '@features/cross-chain/providers/symbiosis-trade-provider/symbiosis-cross-chain-trade';
import { PriceTokenAmount } from '@core/blockchain/tokens/price-token-amount';
import { SYMBIOSIS_CONTRACT_ABI } from '@features/cross-chain/providers/symbiosis-trade-provider/constants/contract-abi';
import { SYMBIOSIS_CONTRACT_ADDRESS } from '@features/cross-chain/providers/symbiosis-trade-provider/constants/contract-address';
import { celerTransitTokens } from '@features/cross-chain/providers/celer-trade-provider/constants/celer-transit-tokens';
import { OneinchEthereumProvider } from '@features/instant-trades/dexes/ethereum/oneinch-ethereum/oneinch-ethereum-provider';
import { OneinchBscProvider } from '@features/instant-trades/dexes/bsc/oneinch-bsc/oneinch-bsc-provider';
import { OneinchPolygonProvider } from '@features/instant-trades/dexes/polygon/oneinch-polygon/oneinch-polygon-provider';
import { OneinchAvalancheProvider } from '@features/instant-trades/dexes/avalanche/oneinch-avalanche/oneinch-avalanche-provider';
import { getSymbiosisConfig } from '@features/cross-chain/providers/symbiosis-trade-provider/constants/symbiosis-config';
import { EMPTY_ADDRESS } from '@core/blockchain/constants/empty-address';
import { CrossChainMinAmountError } from '@common/errors/cross-chain/cross-chain-min-amount-error';
import { CrossChainMaxAmountError } from '@common/errors/cross-chain/cross-chain-max-amount-error';
import { WrappedCrossChainTrade } from '@features/cross-chain/providers/common/models/wrapped-cross-chain-trade';

export class SymbiosisCrossChainTradeProvider extends CrossChainTradeProvider {
    public static isSupportedBlockchain(
        blockchain: BlockchainName
    ): blockchain is SymbiosisCrossChainSupportedBlockchain {
        return symbiosisCrossChainSupportedBlockchains.some(
            supportedBlockchain => supportedBlockchain === blockchain
        );
    }

    public readonly type = CROSS_CHAIN_TRADE_TYPE.SYMBIOSIS;

    private readonly symbiosis = new Symbiosis(getSymbiosisConfig(), 'rubic');

    private readonly oneInchService: Record<
        SymbiosisCrossChainSupportedBlockchain,
        OneinchAbstractProvider
    > = {
        [BLOCKCHAIN_NAME.ETHEREUM]: new OneinchEthereumProvider(),
        [BLOCKCHAIN_NAME.BINANCE_SMART_CHAIN]: new OneinchBscProvider(),
        [BLOCKCHAIN_NAME.POLYGON]: new OneinchPolygonProvider(),
        [BLOCKCHAIN_NAME.AVALANCHE]: new OneinchAvalancheProvider()
    };

    protected get walletAddress(): string {
        return Injector.web3Private.address;
    }

    public async calculate(
        from: PriceTokenAmount,
        toToken: PriceToken,
        options: RequiredCrossChainOptions
    ): Promise<Omit<WrappedCrossChainTrade, 'tradeType'> | null> {
        const fromBlockchain = from.blockchain;
        const toBlockchain = toToken.blockchain;
        if (
            !SymbiosisCrossChainTradeProvider.isSupportedBlockchain(fromBlockchain) ||
            !SymbiosisCrossChainTradeProvider.isSupportedBlockchain(toBlockchain)
        ) {
            return null;
        }

        try {
            const fromAddress = options.fromAddress || this.walletAddress;
            if (!fromAddress) {
                throw new RubicSdkError(
                    'From address or wallet address must not be empty in Symbiosis'
                );
            }

            await this.checkContractState(fromBlockchain);

            const tokenIn = new SymbiosisToken({
                chainId: BlockchainsInfo.getBlockchainByName(fromBlockchain).id,
                address: from.isNative ? '' : from.address,
                decimals: from.decimals,
                isNative: from.isNative
            });
            const feePercent = await this.getFeePercent(fromBlockchain, options.providerAddress);
            const fromAmountWithoutFee = from.tokenAmount
                .multipliedBy(100 - feePercent)
                .dividedBy(100);
            const tokenAmountIn = new SymbiosisTokenAmount(
                tokenIn,
                Web3Pure.toWei(fromAmountWithoutFee, tokenIn.decimals)
            );

            const tokenOut = new SymbiosisToken({
                chainId: BlockchainsInfo.getBlockchainByName(toBlockchain).id,
                address: toToken.isNative ? '' : toToken.address,
                decimals: toToken.decimals,
                isNative: toToken.isNative
            });

            const deadline = Math.floor(Date.now() / 1000) + 60 * options.deadline;
            const slippageTolerance = options.slippageTolerance * 10000;

            const swapping = this.symbiosis.newSwapping();

            const { tokenAmountOut, transactionRequest, priceImpact } = await swapping.exactIn(
                tokenAmountIn,
                tokenOut,
                fromAddress,
                fromAddress,
                fromAddress,
                slippageTolerance,
                deadline,
                true
            );
            const to = new PriceTokenAmount({
                ...toToken.asStruct,
                tokenAmount: new BigNumber(tokenAmountOut.toFixed())
            });

            const gasData =
                options.gasCalculation === 'enabled'
                    ? await SymbiosisCrossChainTrade.getGasData(from, to, transactionRequest)
                    : null;

            return {
                trade: new SymbiosisCrossChainTrade(
                    {
                        from,
                        to,
                        transactionRequest,
                        gasData,
                        priceImpact: parseFloat(priceImpact.toFixed()),
                        slippage: options.slippageTolerance
                    },
                    options.providerAddress
                )
            };
        } catch (err: unknown) {
            let rubicSdkError = this.parseError(err);

            if (err instanceof SymbiosisError && err.message) {
                rubicSdkError = await this.checkMinMaxErrors(err, from);
            }

            return {
                trade: null,
                error: rubicSdkError
            };
        }
    }

    private async getFeePercent(
        fromBlockchain: SymbiosisCrossChainSupportedBlockchain,
        providerAddress: string
    ): Promise<number> {
        const web3PublicService = Injector.web3PublicService.getWeb3Public(fromBlockchain);

        if (providerAddress !== EMPTY_ADDRESS) {
            return (
                (await web3PublicService.callContractMethod<number>(
                    SYMBIOSIS_CONTRACT_ADDRESS[fromBlockchain],
                    SYMBIOSIS_CONTRACT_ABI,
                    'integratorFee',
                    {
                        methodArguments: [providerAddress]
                    }
                )) / 10000
            );
        }

        return (
            (await web3PublicService.callContractMethod<number>(
                SYMBIOSIS_CONTRACT_ADDRESS[fromBlockchain],
                SYMBIOSIS_CONTRACT_ABI,
                'RubicFee'
            )) / 10000
        );
    }

    private async checkMinMaxErrors(
        err: SymbiosisError,
        from: PriceTokenAmount
    ): Promise<RubicSdkError> {
        if (err.code === ErrorCode.AMOUNT_TOO_LOW || err.code === ErrorCode.AMOUNT_LESS_THAN_FEE) {
            const index = err.message!.lastIndexOf('$');
            const transitTokenAmount = new BigNumber(err.message!.substring(index + 1));
            const minAmount = await this.getFromTokenAmount(from, transitTokenAmount, 'min');

            return new CrossChainMinAmountError(minAmount, from);
        }

        if (err?.code === ErrorCode.AMOUNT_TOO_HIGH) {
            const index = err.message!.lastIndexOf('$');
            const transitTokenAmount = new BigNumber(err.message!.substring(index + 1));
            const maxAmount = await this.getFromTokenAmount(from, transitTokenAmount, 'max');

            return new CrossChainMaxAmountError(maxAmount, from);
        }

        return new RubicSdkError(err.message);
    }

    private async getFromTokenAmount(
        from: PriceTokenAmount,
        transitTokenAmount: BigNumber,
        type: 'min' | 'max'
    ): Promise<BigNumber> {
        const blockchain = from.blockchain as SymbiosisCrossChainSupportedBlockchain;

        const transitToken = celerTransitTokens[blockchain];
        if (compareAddresses(from.address, transitToken.address)) {
            return transitTokenAmount;
        }

        const amount = (
            await this.oneInchService[blockchain].calculate(
                new PriceTokenAmount({
                    ...transitToken,
                    price: new BigNumber(1),
                    tokenAmount: transitTokenAmount
                }),
                from,
                {
                    gasCalculation: 'disabled'
                }
            )
        ).to.tokenAmount;
        const approximatePercentDifference = 0.1;

        if (type === 'min') {
            return amount.multipliedBy(1 + approximatePercentDifference);
        }
        return amount.multipliedBy(1 - approximatePercentDifference);
    }

    private async checkContractState(fromBlockchain: SymbiosisCrossChainSupportedBlockchain) {
        const web3PublicService = Injector.web3PublicService.getWeb3Public(fromBlockchain);

        const isPaused = await web3PublicService.callContractMethod<number>(
            SYMBIOSIS_CONTRACT_ADDRESS[fromBlockchain],
            SYMBIOSIS_CONTRACT_ABI,
            'paused'
        );

        if (isPaused) {
            throw new CrossChainIsUnavailableError();
        }
    }
}
