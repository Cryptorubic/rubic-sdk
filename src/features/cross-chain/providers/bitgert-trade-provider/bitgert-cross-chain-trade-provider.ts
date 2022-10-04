/* eslint-disable @typescript-eslint/no-throw-literal */
import BigNumber from 'bignumber.js';
import { CrossChainIsUnavailableError } from 'src/common';
import { CrossChainMaxAmountError } from 'src/common/errors/cross-chain/cross-chain-max-amount.error';
import { BlockchainName, BlockchainsInfo, PriceTokenAmount, Web3Pure } from 'src/core';
import { EMPTY_ADDRESS } from 'src/core/blockchain/constants/empty-address';
import { Injector } from 'src/core/sdk/injector';
import { RequiredCrossChainOptions } from '../../models/cross-chain-options';
import { CROSS_CHAIN_TRADE_TYPE } from '../../models/cross-chain-trade-type';
import { CrossChainTradeProvider } from '../common/cross-chain-trade-provider';
import { CalculationResult } from '../common/models/calculation-result';
import { BitgertCrossChainTrade } from './bitgert-cross-chain-trade';
import { bitgertBridgeAbi } from './constants/bitgert-bridge-abi';
import {
    BitgertCrossChainSupportedBlockchain,
    bitgertCrossChainSupportedBlockchains
} from './constants/bitgert-cross-chain-supported-blockchain';
import { bitgertBridges } from './constants/contract-address';

export class BitgertCrossChainTradeProvider extends CrossChainTradeProvider {
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
            BitgertCrossChainTradeProvider.isSupportedBlockchain(fromBlockchain) &&
            BitgertCrossChainTradeProvider.isSupportedBlockchain(toBlockchain)
        );
    }

    public isSupportedToken(token: PriceTokenAmount): boolean {
        console.log(token);
        return true;
    }

    public async checkDestinationContractBalance(
        fromToken: PriceTokenAmount,
        toToken: PriceTokenAmount
    ): Promise<void> {
        const targetContract = bitgertBridges[toToken.symbol]![
            toToken.blockchain as BitgertCrossChainSupportedBlockchain
        ] as string;
        const tokenBalance = await Injector.web3PublicService
            .getWeb3Public(toToken.blockchain)
            .getTokenBalance(targetContract, toToken.address);

        if (Web3Pure.fromWei(tokenBalance, toToken.decimals).lt(fromToken.tokenAmount)) {
            throw new CrossChainMaxAmountError(
                Web3Pure.fromWei(tokenBalance, toToken.decimals),
                fromToken.symbol
            );
        }
    }

    public checkTokens(fromToken: PriceTokenAmount, toToken: PriceTokenAmount): boolean {
        console.log(fromToken, toToken);
        return true;
    }

    public async calculate(
        fromToken: PriceTokenAmount,
        toToken: PriceTokenAmount,
        options: RequiredCrossChainOptions
    ): Promise<CalculationResult> {
        console.log(options);
        const fromBlockchain = fromToken.blockchain;
        const toBlockchain = toToken.blockchain;
        if (
            !BitgertCrossChainTradeProvider.isSupportedBlockchain(fromBlockchain) ||
            !BitgertCrossChainTradeProvider.isSupportedBlockchain(toBlockchain)
        ) {
            return null;
        }

        try {
            await this.checkBitgertBridgeState(fromToken);
            await this.checkBitgertBridgeState(toToken);
            await this.checkDestinationContractBalance(fromToken, toToken);

            const amountWithSlippage = fromToken.tokenAmount.multipliedBy(
                1 - options.slippageTolerance
            );
            const nativeToken = BlockchainsInfo.getBlockchainByName(fromBlockchain).nativeCoin;
            const cryptoFeeToken = await PriceTokenAmount.createFromToken({
                ...nativeToken,
                weiAmount: new BigNumber(0)
            });

            const trade = new BitgertCrossChainTrade(
                {
                    from: fromToken,
                    to: toToken,
                    toTokenAmountMin: amountWithSlippage,
                    slippageTolerance: options.slippageTolerance,
                    cryptoFeeToken,
                    gasData: null,
                    feeInfo: {
                        fixedFee: null,
                        platformFee: null,
                        cryptoFee: null
                    }
                },
                EMPTY_ADDRESS
            );

            return {
                trade
            };
        } catch (err) {
            return { trade: null, error: CrossChainTradeProvider.parseError(err) };
        }
    }

    public async checkBitgertBridgeState(token: PriceTokenAmount): Promise<void> {
        const web3PublicService = Injector.web3PublicService.getWeb3Public(token.blockchain);
        const targetContract =
            bitgertBridges[token.symbol]![token.blockchain as BitgertCrossChainSupportedBlockchain];

        const isPaused = await web3PublicService.callContractMethod<boolean>(
            targetContract,
            bitgertBridgeAbi,
            'paused'
        );

        if (isPaused) {
            throw new CrossChainIsUnavailableError();
        }
    }
}
