import { PriceToken, PriceTokenAmount } from 'src/common/tokens';
import { blockchainId } from 'src/core/blockchain/utils/blockchains-info/constants/blockchain-id';
import { Web3Private } from 'src/core/blockchain/web3-private-service/web3-private/web3-private';
import { Web3Pure } from 'src/core/blockchain/web3-pure/web3-pure';
import { Injector } from 'src/core/injector/injector';
import { OnChainCalculationOptions } from 'src/features/on-chain/calculation-manager/providers/common/models/on-chain-calculation-options';

import {
    SymbiosisTokenInfo,
    SymbiosisTokenInfoWithAmount
} from '../models/symbiosis-api-common-types';
import { SymbiosisSwapRequestBody } from '../models/symbiosis-api-swap-types';

export class SymbiosisParser {
    public static getSwapRequestBody(
        fromToken: PriceTokenAmount,
        toToken: PriceToken,
        options: OnChainCalculationOptions
    ): SymbiosisSwapRequestBody {
        const walletAddress = (
            Injector.web3PrivateService.getWeb3PrivateByBlockchain(
                fromToken.blockchain
            ) as Web3Private
        ).address as string;

        const fromAddress = options?.fromAddress ?? walletAddress;
        const toAddress = walletAddress;
        const slippage = options?.slippageTolerance ? options.slippageTolerance * 10000 : 100;

        const tokenAmountIn = {
            address: fromToken.address,
            decimals: fromToken.decimals,
            chainId: blockchainId[fromToken.blockchain],
            amount: Web3Pure.toWei(fromToken.tokenAmount, fromToken.decimals)
        } as SymbiosisTokenInfoWithAmount;

        const tokenOut = {
            address: toToken.address,
            decimals: toToken.decimals,
            chainId: blockchainId[toToken.blockchain]
        } as SymbiosisTokenInfo;

        return {
            from: fromAddress,
            to: toAddress,
            slippage,
            tokenAmountIn,
            tokenOut
        };
    }
}
