import { OneinchTrade } from 'src/features';
import { Web3Pure } from 'src/core';
import { CrossChainInstantTrade } from '@features/cross-chain/providers/rubic-trade-provider/rubic-cross-chain-contract-trade/common/cross-chain-instant-trade';

import { DestinationCelerSwapInfo } from '@features/cross-chain/providers/celer-trade-provider/celer-cross-chain-contract-trade/models/destination-celer-swap-info';

import { InchCelerSwapInfo } from '@features/cross-chain/providers/celer-trade-provider/celer-cross-chain-contract-trade/models/inch-celer-swap-info';
import { oneinchApiParams } from '@features/instant-trades/dexes/common/oneinch-common/constants';
import { wrappedNative } from '@features/cross-chain/providers/rubic-trade-provider/rubic-cross-chain-contract-trade/constants/wrapped-native';
import { CelerCrossChainSupportedBlockchain } from '@features/cross-chain/providers/celer-trade-provider/constants/celer-cross-chain-supported-blockchain';
import { EMPTY_ADDRESS } from '@core/blockchain/constants/empty-address';

export class CrossChainOneinchTrade implements CrossChainInstantTrade {
    readonly defaultDeadline = 999999999999999;

    constructor(private readonly instantTrade: OneinchTrade) {}

    public getFirstPath(): string {
        if (!this.instantTrade.path?.[0]) {
            throw new Error('[RUBIC SDK] Instant trade path has to be defined.');
        }
        return this.instantTrade.path[0].address;
    }

    public getSecondPath(): string[] {
        return this.instantTrade.wrappedPath.map(token => Web3Pure.addressToBytes32(token.address));
    }

    public async modifyArgumentsForProvider(
        methodArguments: unknown[][],
        walletAddress: string
    ): Promise<void> {
        const { data } = await this.instantTrade.encode({ fromAddress: walletAddress });
        if (!methodArguments?.[0]) {
            throw new Error('[RUBIC SDK] Method arguments have to be defined.');
        }
        methodArguments[0].push(data);
    }

    public getCelerSourceObject(slippage: number): InchCelerSwapInfo {
        if (!this.instantTrade.transactionData) {
            throw new Error(`[RUBIC SDK] Can't estimate 1inch trade.`);
        }
        const dex = this.instantTrade.contractAddress;
        const [tokenIn, ...restPath] = this.instantTrade.path.map(token => token.address);
        const isOneInchNative =
            oneinchApiParams.nativeAddress === tokenIn || tokenIn === EMPTY_ADDRESS;
        const fromBlockchain = this.instantTrade.from
            .blockchain as CelerCrossChainSupportedBlockchain;
        const firstToken = isOneInchNative ? wrappedNative[fromBlockchain] : tokenIn;
        if (!firstToken) {
            throw new Error('[RUBIC SDK] First token has to be defined');
        }

        const path = [firstToken, restPath.at(-1) as string];

        const amountOutMinimum = this.instantTrade.toTokenAmountMin
            .weiAmountMinusSlippage(slippage)
            .toFixed(0);

        return { dex, path, data: this.instantTrade.transactionData, amountOutMinimum };
    }

    public getCelerDestinationObject(): DestinationCelerSwapInfo {
        throw Error('[RUBIC SDK] 1Inch is not supported as target provider yet.');
    }
}
