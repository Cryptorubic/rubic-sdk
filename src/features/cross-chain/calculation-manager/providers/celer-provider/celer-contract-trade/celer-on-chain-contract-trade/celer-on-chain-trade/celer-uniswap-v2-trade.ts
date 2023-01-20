import { RubicSdkError } from 'src/common/errors';
import { EvmWeb3Pure } from 'src/core/blockchain/web3-pure/typed-web3-pure/evm-web3-pure/evm-web3-pure';
import { CelerOnChainTrade } from 'src/features/cross-chain/calculation-manager/providers/celer-provider/celer-contract-trade/celer-on-chain-contract-trade/celer-on-chain-trade/celer-on-chain-trade';
import { DestinationCelerSwapInfo } from 'src/features/cross-chain/calculation-manager/providers/celer-provider/celer-contract-trade/models/destination-celer-swap-info';
import { SwapVersion } from 'src/features/cross-chain/calculation-manager/providers/celer-provider/celer-contract-trade/models/provider-type.enum';
import { v2LikeCelerSwap } from 'src/features/cross-chain/calculation-manager/providers/celer-provider/celer-contract-trade/models/v2-like-celer-swap-info';
import { UniswapV2AbstractTrade } from 'src/features/on-chain/calculation-manager/providers/dexes/common/uniswap-v2-abstract/uniswap-v2-abstract-trade';

export class CelerUniswapV2Trade implements CelerOnChainTrade {
    readonly defaultDeadline = 999999999999999;

    constructor(private readonly uniswapV2Trade: UniswapV2AbstractTrade) {}

    public getFirstPath(): string[] {
        return this.uniswapV2Trade.wrappedPath.map(token => token.address);
    }

    public getSecondPath(): string[] {
        return this.uniswapV2Trade.wrappedPath.map(token =>
            EvmWeb3Pure.addressToBytes32(token.address)
        );
    }

    public async modifyArgumentsForProvider(
        methodArguments: unknown[][],
        _walletAddress: string,
        swapTokenWithFee = false
    ): Promise<void> {
        const exactTokensForTokens = true;

        if (!methodArguments?.[0]) {
            throw new RubicSdkError('Method arguments must not be empty');
        }

        methodArguments[0].push(exactTokensForTokens);
        methodArguments[0].push(swapTokenWithFee);
    }

    public getCelerSourceObject(): v2LikeCelerSwap {
        const path = this.getFirstPath();
        const amountOutMinimum = this.uniswapV2Trade.toTokenAmountMin.stringWeiAmount;
        const dex = (this.uniswapV2Trade as unknown as { contractAddress: string }).contractAddress;
        return { dex, path, deadline: this.defaultDeadline, amountOutMinimum };
    }

    public getCelerDestinationObject(
        integratorAddress: string,
        receiverAddress: string
    ): DestinationCelerSwapInfo {
        const dex = (this.uniswapV2Trade as unknown as { contractAddress: string }).contractAddress;
        const deadline = this.defaultDeadline;
        const amountOutMinimum = this.uniswapV2Trade.toTokenAmountMin.stringWeiAmount;

        return {
            dex,
            nativeOut: this.uniswapV2Trade.to.isNative,
            receiverEOA: receiverAddress,
            integrator: integratorAddress,
            version: SwapVersion.V2,
            path: this.getFirstPath(),
            pathV3: '0x',
            deadline,
            amountOutMinimum
        };
    }
}
