import { Web3Pure } from 'src/core';
import { CrossChainInstantTrade } from '@features/cross-chain/cross-chain-contract-trade/it-cross-chain-contract-trade/cross-chain-instant-trade/models/cross-chain-instant-trade';
import { UniswapV3AbstractTrade } from '@features/instant-trades/dexes/common/uniswap-v3-abstract/uniswap-v3-abstract-trade';
import { UniswapV3QuoterController } from '@features/instant-trades/dexes/common/uniswap-v3-abstract/utils/quoter-controller/uniswap-v3-quoter-controller';
import { compareAddresses } from 'src/common';

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
}
