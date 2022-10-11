import { UniswapV3AbstractTrade } from 'src/features/on-chain/calculation-manager/providers/dexes/abstract/uniswap-v3-abstract/uniswap-v3-abstract-trade';
import { RubicSdkError } from 'src/common/errors';
import { UniswapV3QuoterController } from 'src/features/on-chain/calculation-manager/providers/dexes/abstract/uniswap-v3-abstract/utils/quoter-controller/uniswap-v3-quoter-controller';
import { CelerOnChainTrade } from 'src/features/cross-chain/calculation-manager/providers/celer-provider/celer-contract-trade/celer-on-chain-contract-trade/celer-on-chain-trade/celer-on-chain-trade';
import { DestinationCelerSwapInfo } from 'src/features/cross-chain/calculation-manager/providers/celer-provider/celer-contract-trade/models/destination-celer-swap-info';
import { compareAddresses } from 'src/common/utils/blockchain';
import { SwapVersion } from 'src/features/cross-chain/calculation-manager/providers/celer-provider/celer-contract-trade/models/provider-type.enum';
import { v3LikeCelerSwapInfo } from 'src/features/cross-chain/calculation-manager/providers/celer-provider/celer-contract-trade/models/v3-like-celer-swap-info';
import { UNISWAP_V3_SWAP_ROUTER_CONTRACT_ADDRESS } from 'src/features/on-chain/calculation-manager/providers/dexes/abstract/uniswap-v3-abstract/constants/swap-router-contract-abi';
import { EvmWeb3Pure } from 'src/core/blockchain/web3-pure/typed-web3-pure/evm-web3-pure';

export class CelerUniswapV3Trade implements CelerOnChainTrade {
    readonly defaultDeadline = 999999999999999;

    constructor(private readonly uniswapV3Trade: UniswapV3AbstractTrade) {}

    public getFirstPath(): string {
        const { route } = this.uniswapV3Trade;

        return UniswapV3QuoterController.getEncodedPoolsPath(
            route.poolsPath,
            route.initialTokenAddress
        );
    }

    public getSecondPath(): string[] {
        const { route } = this.uniswapV3Trade;
        const path = [EvmWeb3Pure.addressToBytes32(route.initialTokenAddress)];

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

    public getCelerSourceObject(): v3LikeCelerSwapInfo {
        const dex = UNISWAP_V3_SWAP_ROUTER_CONTRACT_ADDRESS;
        const path = this.getFirstPath();
        const amountOutMinimum = this.uniswapV3Trade.toTokenAmountMin.stringWeiAmount;

        return { dex, path, deadline: this.defaultDeadline, amountOutMinimum };
    }

    public getCelerDestinationObject(
        integratorAddress: string,
        receiverAddress: string
    ): DestinationCelerSwapInfo {
        const dex = UNISWAP_V3_SWAP_ROUTER_CONTRACT_ADDRESS;
        const pathV3 = this.getFirstPath();
        const deadline = this.defaultDeadline;
        const amountOutMinimum = this.uniswapV3Trade.toTokenAmountMin.stringWeiAmount;

        return {
            dex,
            nativeOut: this.uniswapV3Trade.to.isNative,
            receiverEOA: receiverAddress,
            integrator: integratorAddress,
            version: SwapVersion.V3,
            path: [EvmWeb3Pure.EMPTY_ADDRESS],
            pathV3,
            deadline,
            amountOutMinimum
        };
    }
}
