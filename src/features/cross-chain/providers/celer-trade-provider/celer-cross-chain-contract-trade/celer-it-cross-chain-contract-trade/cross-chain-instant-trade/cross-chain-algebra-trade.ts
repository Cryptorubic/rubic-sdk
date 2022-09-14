import { AlgebraQuoterController } from 'src/features/instant-trades/dexes/polygon/algebra/utils/quoter-controller/algebra-quoter-controller';
import { RubicSdkError } from 'src/common/errors';
import { ALGEBRA_SWAP_ROUTER_CONTRACT_ADDRESS } from 'src/features/instant-trades/dexes/polygon/algebra/constants/swap-router-contract-data';
import { CrossChainInstantTrade } from 'src/features/cross-chain/providers/celer-trade-provider/celer-cross-chain-contract-trade/celer-it-cross-chain-contract-trade/cross-chain-instant-trade/cross-chain-instant-trade';
import { AlgebraTrade } from 'src/features/instant-trades/dexes/polygon/algebra/algebra-trade';
import { DestinationCelerSwapInfo } from 'src/features/cross-chain/providers/celer-trade-provider/celer-cross-chain-contract-trade/models/destination-celer-swap-info';
import { SwapVersion } from 'src/features/cross-chain/providers/celer-trade-provider/celer-cross-chain-contract-trade/models/provider-type.enum';
import { v3LikeCelerSwapInfo } from 'src/features/cross-chain/providers/celer-trade-provider/celer-cross-chain-contract-trade/models/v3-like-celer-swap-info';
import { EvmWeb3Pure } from 'src/core/blockchain/web3-pure/typed-web3-pure/evm-web3-pure';

export class CrossChainAlgebraTrade implements CrossChainInstantTrade {
    readonly defaultDeadline = 999999999999999;

    constructor(private readonly instantTrade: AlgebraTrade) {}

    public getFirstPath(): string {
        return AlgebraQuoterController.getEncodedPath(Array.from(this.instantTrade.path));
    }

    public getSecondPath(): string[] {
        return this.instantTrade.wrappedPath.map(token =>
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
        const amountOutMinimum = this.instantTrade.toTokenAmountMin.stringWeiAmount;

        return { dex, path, deadline: this.defaultDeadline, amountOutMinimum };
    }

    public getCelerDestinationObject(
        integratorAddress: string,
        receiverAddress: string
    ): DestinationCelerSwapInfo {
        const dex = ALGEBRA_SWAP_ROUTER_CONTRACT_ADDRESS;
        const pathV3 = this.getFirstPath();
        const deadline = this.defaultDeadline;
        const amountOutMinimum = this.instantTrade.toTokenAmountMin.stringWeiAmount;

        return {
            dex,
            nativeOut: this.instantTrade.to.isNative,
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
