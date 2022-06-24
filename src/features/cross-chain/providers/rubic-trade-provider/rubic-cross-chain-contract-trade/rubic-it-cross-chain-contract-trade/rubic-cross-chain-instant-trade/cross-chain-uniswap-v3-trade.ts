import { Web3Pure } from 'src/core';
import { CrossChainInstantTrade } from '@rsdk-features/cross-chain/providers/rubic-trade-provider/rubic-cross-chain-contract-trade/common/cross-chain-instant-trade';
import { UniswapV3AbstractTrade } from '@rsdk-features/instant-trades/dexes/common/uniswap-v3-abstract/uniswap-v3-abstract-trade';
import { UniswapV3QuoterController } from '@rsdk-features/instant-trades/dexes/common/uniswap-v3-abstract/utils/quoter-controller/uniswap-v3-quoter-controller';
import { compareAddresses, RubicSdkError } from 'src/common';
import { v3LikeCelerSwapInfo } from '@rsdk-features/cross-chain/providers/celer-trade-provider/celer-cross-chain-contract-trade/models/v3-like-celer-swap-info';
import { UNISWAP_V3_SWAP_ROUTER_CONTRACT_ADDRESS } from '@rsdk-features/instant-trades/dexes/common/uniswap-v3-abstract/constants/swap-router-contract-abi';
import { DestinationCelerSwapInfo } from '@rsdk-features/cross-chain/providers/celer-trade-provider/celer-cross-chain-contract-trade/models/destination-celer-swap-info';
import { SwapVersion } from '@rsdk-features/cross-chain/providers/common/celer-rubic/models/provider-type.enum';
import { EMPTY_ADDRESS } from '@rsdk-core/blockchain/constants/empty-address';

export class CrossChainUniswapV3Trade implements CrossChainInstantTrade {
    readonly defaultDeadline = 999999999999999;

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

        if (!methodArguments?.[0]) {
            throw new RubicSdkError('[RUBIC SDK] Method arguments array must not be empty');
        }

        methodArguments[0].push(exactTokensForTokens);
    }

    public getCelerSourceObject(slippage: number): v3LikeCelerSwapInfo {
        const dex = UNISWAP_V3_SWAP_ROUTER_CONTRACT_ADDRESS;
        const path = this.getFirstPath();
        const amountOutMinimum = this.instantTrade.toTokenAmountMin
            .weiAmountMinusSlippage(slippage)
            .toFixed(0);

        return { dex, path, deadline: this.defaultDeadline, amountOutMinimum };
    }

    public getCelerDestinationObject(
        slippage: number,
        integratorAddress: string
    ): DestinationCelerSwapInfo {
        const dex = UNISWAP_V3_SWAP_ROUTER_CONTRACT_ADDRESS;
        const pathV3 = this.getFirstPath();
        const deadline = this.defaultDeadline;
        const amountOutMinimum = this.instantTrade.toTokenAmountMin
            .weiAmountMinusSlippage(slippage)
            .toFixed(0);

        return {
            dex,
            integrator: integratorAddress,
            version: SwapVersion.V3,
            path: [EMPTY_ADDRESS],
            pathV3,
            deadline,
            amountOutMinimum
        };
    }
}
