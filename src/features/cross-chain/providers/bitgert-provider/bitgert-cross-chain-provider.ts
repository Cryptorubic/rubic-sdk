/* eslint-disable @typescript-eslint/no-throw-literal */
import BigNumber from 'bignumber.js';
import {
    CrossChainIsUnavailableError,
    MaxAmountError,
    MinAmountError,
    UnsupportedReceiverAddressError,
    UnsupportedTokenPairError
} from 'src/common/errors';
import { PriceTokenAmount } from 'src/common/tokens';
import { nativeTokensList } from 'src/common/tokens/constants/native-tokens';
import {
    BlockchainName,
    BLOCKCHAIN_NAME,
    EvmBlockchainName
} from 'src/core/blockchain/models/blockchain-name';
import { EvmWeb3Pure } from 'src/core/blockchain/web3-pure/typed-web3-pure/evm-web3-pure';
import { Web3Pure } from 'src/core/blockchain/web3-pure/web3-pure';
import { Injector } from 'src/core/injector/injector';
import { RequiredCrossChainOptions } from '../../models/cross-chain-options';
import { CROSS_CHAIN_TRADE_TYPE } from '../../models/cross-chain-trade-type';
import { CrossChainProvider } from '../common/cross-chain-provider';
import { CalculationResult } from '../common/models/calculation-result';
import { BitgertCrossChainTrade } from './bitgert-cross-chain-trade';
import { bitgertBridgeAbi } from './constants/bitgert-bridge-abi';
import {
    BitgertCrossChainSupportedBlockchain,
    bitgertCrossChainSupportedBlockchains
} from './constants/bitgert-cross-chain-supported-blockchain';
import { bitgertBridges } from './constants/contract-address';
import { supportedTokens } from './constants/supported-tokens';

const bitgertStableFeePercent = 0.02;
const bitgertAltcointFeePercent = 0.002;

export class BitgertCrossChainProvider extends CrossChainProvider {
    public readonly type = CROSS_CHAIN_TRADE_TYPE.BITGERT_BRIDGE;

    public static isSupportedBlockchain(
        blockchain: BlockchainName
    ): blockchain is BitgertCrossChainSupportedBlockchain {
        return bitgertCrossChainSupportedBlockchains.some(
            supportedBlockchain => supportedBlockchain === blockchain
        );
    }

    public isSupportedBlockchains(
        fromBlockchain: BlockchainName,
        toBlockchain: BlockchainName
    ): boolean {
        return (
            BitgertCrossChainProvider.isSupportedBlockchain(fromBlockchain) &&
            BitgertCrossChainProvider.isSupportedBlockchain(toBlockchain)
        );
    }

    public async calculate(
        fromToken: PriceTokenAmount<EvmBlockchainName>,
        toToken: PriceTokenAmount<EvmBlockchainName>,
        options: RequiredCrossChainOptions
    ): Promise<CalculationResult> {
        if (options.receiverAddress) {
            throw new UnsupportedReceiverAddressError();
        }

        const fromBlockchain = fromToken.blockchain;
        const toBlockchain = toToken.blockchain;

        if (
            !BitgertCrossChainProvider.isSupportedBlockchain(fromBlockchain) ||
            !BitgertCrossChainProvider.isSupportedBlockchain(toBlockchain)
        ) {
            return null;
        }

        try {
            this.checkTokenPair(fromToken, toToken);
            await this.checkBitgertBridgesState(fromToken, toToken);
            await this.checkMinMaxErrors(fromToken, toToken);
            const nativeToken = nativeTokensList[fromBlockchain];
            const cryptoFeeToken = await PriceTokenAmount.createFromToken({
                ...nativeToken,
                weiAmount: new BigNumber(0)
            });
            const { to, comission } = this.getOutputTokenAndComission(fromToken, toToken);
            const trade = new BitgertCrossChainTrade(
                {
                    from: fromToken as PriceTokenAmount<BitgertCrossChainSupportedBlockchain>,
                    to: to as PriceTokenAmount<BitgertCrossChainSupportedBlockchain>,
                    toTokenAmountMin: to.tokenAmount,
                    slippageTolerance: 0,
                    cryptoFeeToken,
                    gasData: null,
                    priceImpact: 0,
                    feeInfo: {
                        fixedFee: null,
                        platformFee: {
                            percent: comission * 100,
                            tokenSymbol: toToken.symbol
                        },
                        cryptoFee: null
                    }
                },
                EvmWeb3Pure.EMPTY_ADDRESS
            );

            return {
                trade
            };
        } catch (err) {
            console.error('PROVIDER ERROR', err);
            return { trade: null, error: CrossChainProvider.parseError(err) };
        }
    }

    public checkTokenPair(from: PriceTokenAmount, to: PriceTokenAmount): void {
        const fromSymbol = from.symbol.toUpperCase();
        const toSymbol = to.symbol.toUpperCase();
        const isSupportedTokenPair =
            fromSymbol === toSymbol &&
            supportedTokens[from.blockchain]!.includes(fromSymbol) &&
            supportedTokens[to.blockchain]!.includes(toSymbol);

        if (!isSupportedTokenPair) {
            throw new UnsupportedTokenPairError();
        }
    }

    public async checkMinMaxErrors(
        fromToken: PriceTokenAmount<EvmBlockchainName>,
        toToken: PriceTokenAmount<EvmBlockchainName>
    ): Promise<void> {
        const tokenPrice =
            fromToken.blockchain === BLOCKCHAIN_NAME.BITGERT
                ? await Injector.coingeckoApi.getTokenPrice({
                      address: toToken.address,
                      blockchain: toToken.blockchain
                  })
                : await Injector.coingeckoApi.getTokenPrice({
                      address: fromToken.address,
                      blockchain: fromToken.blockchain
                  });
        const minFromTokenAmount = new BigNumber(10).dividedBy(tokenPrice);
        const targetContract =
            bitgertBridges[toToken.symbol]![
                toToken.blockchain as BitgertCrossChainSupportedBlockchain
            ];
        const targetContractTokenBalance = await Injector.web3PublicService
            .getWeb3Public(toToken.blockchain)
            .getTokenBalance(targetContract, toToken.address);

        if (fromToken.tokenAmount.lt(minFromTokenAmount)) {
            throw new MinAmountError(minFromTokenAmount, fromToken.symbol);
        }

        if (
            Web3Pure.fromWei(targetContractTokenBalance, toToken.decimals).lt(fromToken.tokenAmount)
        ) {
            throw new MaxAmountError(
                Web3Pure.fromWei(targetContractTokenBalance, toToken.decimals),
                fromToken.symbol
            );
        }
    }

    public getOutputTokenAndComission(
        fromToken: PriceTokenAmount,
        toToken: PriceTokenAmount
    ): { to: PriceTokenAmount; comission: number } {
        const inputAmount = fromToken.tokenAmount;
        let toAmount = inputAmount;
        let comission = bitgertStableFeePercent;

        if (['USDC', 'USDT', 'BUSD', 'SHIB', 'MATIC'].includes(fromToken.symbol)) {
            toAmount = inputAmount.multipliedBy(1 - bitgertStableFeePercent);
            comission = bitgertStableFeePercent;
        }

        if (['BNB', 'ETH'].includes(fromToken.symbol)) {
            toAmount = inputAmount.multipliedBy(1 - bitgertAltcointFeePercent);
            comission = bitgertAltcointFeePercent;
        }

        return {
            to: new PriceTokenAmount({ ...toToken.asStruct, tokenAmount: toAmount }),
            comission
        };
    }

    public async checkBitgertBridgesState(
        fromToken: PriceTokenAmount<EvmBlockchainName>,
        toToken: PriceTokenAmount<EvmBlockchainName>
    ): Promise<void> {
        const srcBridgeContract =
            bitgertBridges[fromToken.symbol]![
                fromToken.blockchain as BitgertCrossChainSupportedBlockchain
            ];
        const dstBridgeContract =
            bitgertBridges[toToken.symbol]![
                toToken.blockchain as BitgertCrossChainSupportedBlockchain
            ];

        const [srcContractPaused, dstContractPaused] = await Promise.all([
            Injector.web3PublicService
                .getWeb3Public(fromToken.blockchain)
                .callContractMethod<boolean>(
                    srcBridgeContract as string,
                    bitgertBridgeAbi,
                    'paused'
                ),
            Injector.web3PublicService
                .getWeb3Public(toToken.blockchain)
                .callContractMethod<boolean>(
                    dstBridgeContract as string,
                    bitgertBridgeAbi,
                    'paused'
                )
        ]);

        if (srcContractPaused || dstContractPaused) {
            throw new CrossChainIsUnavailableError();
        }
    }
}
