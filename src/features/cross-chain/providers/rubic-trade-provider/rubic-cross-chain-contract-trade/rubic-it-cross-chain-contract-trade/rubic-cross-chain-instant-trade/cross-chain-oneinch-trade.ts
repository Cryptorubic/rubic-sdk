import { OneinchTrade, UniswapV2AbstractTrade } from 'src/features';
import { Web3Pure } from 'src/core';
import { CrossChainInstantTrade } from '@features/cross-chain/providers/rubic-trade-provider/rubic-cross-chain-contract-trade/common/cross-chain-instant-trade';

import { SwapInfoDest } from '@features/cross-chain/providers/celer-trade-provider/celer-cross-chain-contract-trade/models/swap-info-dest.interface';
import { EMPTY_ADDRESS } from '@core/blockchain/constants/empty-address';

import { SwapInfoInch } from '@features/cross-chain/providers/celer-trade-provider/celer-cross-chain-contract-trade/models/swap-info-inch.interface';
import { oneinchApiParams } from '@features/instant-trades/dexes/common/oneinch-common/constants';
import { wrappedNative } from '@features/cross-chain/providers/rubic-trade-provider/rubic-cross-chain-contract-trade/constants/wrapped-native';
import { CelerCrossChainSupportedBlockchain } from '@features/cross-chain/providers/celer-trade-provider/constants/celer-cross-chain-supported-blockchain';

export class CrossChainOneinchTrade implements CrossChainInstantTrade {
    constructor(private readonly instantTrade: OneinchTrade) {}

    public getFirstPath(): string {
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
        methodArguments[0].push(data);
    }

    // @TODO Add 1Inch
    public getCelerSourceObject(slippage: number): SwapInfoInch {
        const dex = this.instantTrade.contractAddress;
        const [tokenIn, ...restPath] = this.instantTrade.path.map(token => token.address);
        const isOneInchNative = oneinchApiParams.nativeAddress === tokenIn;
        const fromBlockchain = this.instantTrade.from
            .blockchain as CelerCrossChainSupportedBlockchain;
        const firstToken = isOneInchNative ? wrappedNative[fromBlockchain] : tokenIn;

        const path = [firstToken, restPath.at(-1) as string];

        const amountOutMinimum = this.instantTrade.toTokenAmountMin
            .weiAmountMinusSlippage(slippage)
            .toFixed(0);

        return { dex, path, data: '', amountOutMinimum };
    }

    // @TODO Add 1Inch
    public getCelerDestinationObject(slippage: number): SwapInfoDest {
        const dex = UniswapV2AbstractTrade.getContractAddress(this.instantTrade.from.blockchain);
        const path = this.getSecondPath();
        const deadline = 0;
        const amountOutMinimum = this.instantTrade.toTokenAmountMin
            .weiAmountMinusSlippage(slippage)
            .toFixed(0);

        return { dex, integrator: EMPTY_ADDRESS, path, deadline, amountOutMinimum };
    }
}
