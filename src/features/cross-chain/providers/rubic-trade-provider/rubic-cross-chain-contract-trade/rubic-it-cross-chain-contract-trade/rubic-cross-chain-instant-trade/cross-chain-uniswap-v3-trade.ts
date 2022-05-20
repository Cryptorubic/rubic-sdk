import { Web3Pure } from 'src/core';
import { CrossChainInstantTrade } from '@features/cross-chain/providers/rubic-trade-provider/rubic-cross-chain-contract-trade/common/cross-chain-instant-trade';
import { UniswapV3AbstractTrade } from '@features/instant-trades/dexes/common/uniswap-v3-abstract/uniswap-v3-abstract-trade';
import { UniswapV3QuoterController } from '@features/instant-trades/dexes/common/uniswap-v3-abstract/utils/quoter-controller/uniswap-v3-quoter-controller';
import { compareAddresses } from 'src/common';
import { SwapInfoV3 } from '@features/cross-chain/providers/celer-trade-provider/celer-cross-chain-contract-trade/models/swap-info-v3.interface';
import { UNISWAP_V3_SWAP_ROUTER_CONTRACT_ADDRESS } from '@features/instant-trades/dexes/common/uniswap-v3-abstract/constants/swap-router-contract-abi';
import { SwapInfoDest } from '@features/cross-chain/providers/celer-trade-provider/celer-cross-chain-contract-trade/models/swap-info-dest.interface';
import { UniswapV2AbstractTrade } from 'src/features';
import { EMPTY_ADDRESS } from '@core/blockchain/constants/empty-address';

export class CrossChainUniswapV3Trade implements CrossChainInstantTrade {
    constructor(private readonly instantTrade: UniswapV3AbstractTrade) {}

    public getFirstPath(): string {
        const { route } = this.instantTrade;

        return UniswapV3QuoterController.getEncodedPoolsPath(
            route.poolsPath,
            route.initialTokenAddress
        );
    }

    public getSecondPath(): string[] {
        const { route } = this.instantTrade;
        const path = [Web3Pure.addressToBytes32(route.initialTokenAddress)];

        let lastTokenAddress = route.initialTokenAddress;

        route.poolsPath.forEach(pool => {
            const newToken = compareAddresses(pool.token0.address, lastTokenAddress)
                ? pool.token1
                : pool.token0;
            lastTokenAddress = newToken.address;

            path.push(
                `0x${pool.fee.toString(16).padStart(6, '0').padEnd(24, '0')}${lastTokenAddress
                    .slice(2)
                    .toLowerCase()}`
            );
        });

        return path;
    }

    public async modifyArgumentsForProvider(methodArguments: unknown[][]): Promise<void> {
        const exactTokensForTokens = true;

        methodArguments[0].push(exactTokensForTokens);
    }

    // @TODO
    public getCelerSourceObject(slippage: number): SwapInfoV3 {
        const dex = UNISWAP_V3_SWAP_ROUTER_CONTRACT_ADDRESS;
        const path = this.getFirstPath();
        const amountOutMinimum = this.instantTrade.toTokenAmountMin
            .weiAmountMinusSlippage(slippage)
            .toFixed(0);

        return { dex, path, deadline: 0, amountOutMinimum };
    }

    // @TODO
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
