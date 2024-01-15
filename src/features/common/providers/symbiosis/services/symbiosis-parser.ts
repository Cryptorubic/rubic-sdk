import { PriceToken, PriceTokenAmount } from 'src/common/tokens';
import { blockchainId } from 'src/core/blockchain/utils/blockchains-info/constants/blockchain-id';
import { Web3Private } from 'src/core/blockchain/web3-private-service/web3-private/web3-private';
import { Web3Pure } from 'src/core/blockchain/web3-pure/web3-pure';
import { Injector } from 'src/core/injector/injector';

import {
    SymbiosisTokenInfo,
    SymbiosisTokenInfoWithAmount
} from '../models/symbiosis-api-common-types';
import { SymbiosisSwapRequestOptions } from '../models/symbiosis-api-parser-types';
import { SymbiosisSwapRequestBody } from '../models/symbiosis-api-swap-types';

export class SymbiosisParser {
    public static getSwapRequestBody(
        fromToken: PriceTokenAmount,
        toToken: PriceToken,
        options: SymbiosisSwapRequestOptions
    ): SymbiosisSwapRequestBody {
        const walletAddress = (
            Injector.web3PrivateService.getWeb3PrivateByBlockchain(
                fromToken.blockchain
            ) as Web3Private
        ).address as string;

        const toAddress = options.receiverAddress ?? walletAddress;
        const fromAddress = options.fromAddress ?? walletAddress;
        const slippage = options.slippage * 10000;

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
