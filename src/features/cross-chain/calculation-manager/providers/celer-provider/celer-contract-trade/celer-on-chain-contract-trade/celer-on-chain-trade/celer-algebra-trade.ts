import { RubicSdkError } from 'src/common/errors';
import { ALGEBRA_SWAP_ROUTER_CONTRACT_ADDRESS } from 'src/features/on-chain/calculation-manager/providers/dexes/polygon/algebra/constants/swap-router-contract-data';
import { CelerOnChainTrade } from 'src/features/cross-chain/calculation-manager/providers/celer-provider/celer-contract-trade/celer-on-chain-contract-trade/celer-on-chain-trade/celer-on-chain-trade';
import { AlgebraTrade } from 'src/features/on-chain/calculation-manager/providers/dexes/polygon/algebra/algebra-trade';
import { DestinationCelerSwapInfo } from 'src/features/cross-chain/calculation-manager/providers/celer-provider/celer-contract-trade/models/destination-celer-swap-info';
import { SwapVersion } from 'src/features/cross-chain/calculation-manager/providers/celer-provider/celer-contract-trade/models/provider-type.enum';
import { v3LikeCelerSwapInfo } from 'src/features/cross-chain/calculation-manager/providers/celer-provider/celer-contract-trade/models/v3-like-celer-swap-info';
import { EvmWeb3Pure } from 'src/core/blockchain/web3-pure/typed-web3-pure/evm-web3-pure';
import { AlgebraQuoterController } from 'src/features/on-chain/calculation-manager/providers/dexes/common/algebra/algebra-quoter-controller';

export class CelerAlgebraTrade implements CelerOnChainTrade {
    readonly defaultDeadline = 999999999999999;

    constructor(private readonly algebraTrade: AlgebraTrade) {}

    public getFirstPath(): string {
        return AlgebraQuoterController.getEncodedPath(Array.from(this.algebraTrade.path));
    }

    public getSecondPath(): string[] {
        return this.algebraTrade.wrappedPath.map(token =>
            EvmWeb3Pure.addressToBytes32(token.address)
        );
    }

    public async modifyArgumentsForProvider(methodArguments: unknown[][]): Promise<void> {
        const exactTokensForTokens = true;

        if (!methodArguments?.[0]) {
            throw new RubicSdkError('Method arguments array must not be empty');
        }

        methodArguments[0].push(exactTokensForTokens);
    }

    public getCelerSourceObject(): v3LikeCelerSwapInfo {
        const dex = ALGEBRA_SWAP_ROUTER_CONTRACT_ADDRESS;
        const path = this.getFirstPath();
        const amountOutMinimum = this.algebraTrade.toTokenAmountMin.stringWeiAmount;

        return { dex, path, deadline: this.defaultDeadline, amountOutMinimum };
    }

    public getCelerDestinationObject(
        integratorAddress: string,
        receiverAddress: string
    ): DestinationCelerSwapInfo {
        const dex = ALGEBRA_SWAP_ROUTER_CONTRACT_ADDRESS;
        const pathV3 = this.getFirstPath();
        const deadline = this.defaultDeadline;
        const amountOutMinimum = this.algebraTrade.toTokenAmountMin.stringWeiAmount;

        return {
            dex,
            nativeOut: this.algebraTrade.to.isNative,
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
