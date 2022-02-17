import { CrossChainSupportedBlockchain } from '@features/cross-chain/constants/cross-chain-supported-blockchains';
import { CrossChainContractData } from '@features/cross-chain/contract-data/cross-chain-contract-data';
import { ContractTrade } from '@features/cross-chain/contract-trade/contract-trade';
import BigNumber from 'bignumber.js';
import { PriceTokenAmount, Web3Pure } from 'src/core';
import { OneinchTrade } from '@features/swap/dexes/common/oneinch-common/oneinch-trade';
import { UniswapV3AbstractTrade } from '@features/swap/dexes/common/uniswap-v3-abstract/uniswap-v3-abstract-trade';
import { UniswapV2AbstractTrade } from '@features/swap/dexes/common/uniswap-v2-abstract/uniswap-v2-abstract-trade';
import { AlgebraTrade } from '@features/swap/dexes/polygon/algebra/algebra-trade';
import { UniswapV3QuoterController } from '@features/swap/dexes/common/uniswap-v3-abstract/utils/quoter-controller/uniswap-v3-quoter-controller';
import { AlgebraQuoterController } from '@features/swap/dexes/polygon/algebra/utils/quoter-controller/algebra-quoter-controller';
import { CrossChainSupportedInstantTrade } from '@features/cross-chain/models/cross-chain-supported-instant-trade';
import { compareAddresses } from 'src/common';

export class InstantTradeContractTrade extends ContractTrade {
    public readonly fromToken: PriceTokenAmount;

    public readonly toToken: PriceTokenAmount;

    public readonly toTokenAmountMin: BigNumber;

    constructor(
        blockchain: CrossChainSupportedBlockchain,
        contract: CrossChainContractData,
        providerIndex: number,
        public readonly slippageTolerance: number,
        private readonly instantTrade: CrossChainSupportedInstantTrade
    ) {
        super(blockchain, contract, providerIndex);

        this.fromToken = this.instantTrade.from;
        this.toToken = this.instantTrade.to;
        this.toTokenAmountMin = this.toToken.tokenAmount.multipliedBy(1 - this.slippageTolerance);
    }

    protected getFirstPath(): string[] | string {
        if (this.instantTrade instanceof OneinchTrade) {
            return this.instantTrade.path[0].address;
        }

        if (this.instantTrade instanceof UniswapV3AbstractTrade) {
            const { route } = this.instantTrade;

            return UniswapV3QuoterController.getEncodedPoolsPath(
                route.poolsPath,
                route.initialTokenAddress
            );
        }

        if (this.instantTrade instanceof AlgebraTrade) {
            return AlgebraQuoterController.getEncodedPath(Array.from(this.instantTrade.path));
        }

        return this.instantTrade.wrappedPath.map(token => token.address);
    }

    protected getSecondPath(): string[] {
        if (this.instantTrade instanceof UniswapV3AbstractTrade) {
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

        if (this.instantTrade instanceof OneinchTrade) {
            return this.instantTrade.path.map(token => Web3Pure.addressToBytes32(token.address));
        }

        return this.instantTrade.wrappedPath.map(token => Web3Pure.addressToBytes32(token.address));
    }

    protected async modifyArgumentsForProvider(
        methodArguments: unknown[][],
        walletAddress: string
    ): Promise<void> {
        const exactTokensForTokens = true;
        const swapTokenWithFee = false;

        if (this.instantTrade instanceof OneinchTrade) {
            const { data } = await this.instantTrade.encode({ fromAddress: walletAddress });
            methodArguments[0].push(data);
        } else {
            methodArguments[0].push(exactTokensForTokens);

            if (this.instantTrade instanceof UniswapV2AbstractTrade) {
                methodArguments[0].push(swapTokenWithFee);
            }
        }
    }
}
