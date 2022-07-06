import { OneinchTrade } from 'src/features';
import { Web3Pure } from 'src/core';
import { CrossChainInstantTrade } from '@rsdk-features/cross-chain/providers/rubic-trade-provider/rubic-cross-chain-contract-trade/common/cross-chain-instant-trade';

import { DestinationCelerSwapInfo } from '@rsdk-features/cross-chain/providers/celer-trade-provider/celer-cross-chain-contract-trade/models/destination-celer-swap-info';

import { InchCelerSwapInfo } from '@rsdk-features/cross-chain/providers/celer-trade-provider/celer-cross-chain-contract-trade/models/inch-celer-swap-info';
import { oneinchApiParams } from '@rsdk-features/instant-trades/dexes/common/oneinch-common/constants';
import { wrappedNative } from '@rsdk-features/cross-chain/providers/celer-trade-provider/constants/wrapped-native';
import { CelerCrossChainSupportedBlockchain } from '@rsdk-features/cross-chain/providers/celer-trade-provider/constants/celer-cross-chain-supported-blockchain';
import { EMPTY_ADDRESS } from '@rsdk-core/blockchain/constants/empty-address';
import { RubicSdkError } from 'src/common';

export class CrossChainOneinchTrade implements CrossChainInstantTrade {
    readonly defaultDeadline = 999999999999999;

    constructor(private readonly instantTrade: OneinchTrade) {}

    public getFirstPath(): string {
        if (!this.instantTrade.path?.[0]) {
            throw new RubicSdkError('Instant trade path has to be defined');
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
            throw new RubicSdkError('Method arguments array must not be empty');
        }
        methodArguments[0].push(data);
    }

    public getCelerSourceObject(): InchCelerSwapInfo {
        if (!this.instantTrade.transactionData) {
            throw new RubicSdkError(`Can't estimate 1inch trade`);
        }
        const dex = this.instantTrade.contractAddress;
        const [tokenIn, ...restPath] = this.instantTrade.path.map(token => token.address);
        const isOneInchNative =
            oneinchApiParams.nativeAddress === tokenIn || tokenIn === EMPTY_ADDRESS;
        const fromBlockchain = this.instantTrade.from
            .blockchain as CelerCrossChainSupportedBlockchain;
        const firstToken = isOneInchNative ? wrappedNative[fromBlockchain] : tokenIn;
        if (!firstToken) {
            throw new RubicSdkError('First token has to be defined');
        }

        const secondToken = restPath?.pop();
        if (!secondToken) {
            throw new RubicSdkError('Second token has to be defined');
        }

        const path = [firstToken, secondToken];

        const amountOutMinimum = this.instantTrade.toTokenAmountMin.stringWeiAmount;

        return { dex, path, data: this.instantTrade.transactionData, amountOutMinimum };
    }

    public getCelerDestinationObject(): DestinationCelerSwapInfo {
        throw Error('[RUBIC SDK] 1Inch is not supported as target provider yet.');
    }
}
