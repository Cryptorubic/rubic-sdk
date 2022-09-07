import { CrossChainInstantTrade } from '@rsdk-features/cross-chain/providers/rubic-trade-provider/rubic-cross-chain-contract-trade/common/cross-chain-instant-trade';
import { AlgebraTrade } from '@rsdk-features/instant-trades/dexes/polygon/algebra/algebra-trade';
import { AlgebraQuoterController } from '@rsdk-features/instant-trades/dexes/polygon/algebra/utils/quoter-controller/algebra-quoter-controller';
import { DestinationCelerSwapInfo } from '@rsdk-features/cross-chain/providers/celer-trade-provider/celer-cross-chain-contract-trade/models/destination-celer-swap-info';
import { v3LikeCelerSwapInfo } from '@rsdk-features/cross-chain/providers/celer-trade-provider/celer-cross-chain-contract-trade/models/v3-like-celer-swap-info';
import { SwapVersion } from '@rsdk-features/cross-chain/providers/common/celer-rubic/models/provider-type.enum';
import { ALGEBRA_SWAP_ROUTER_CONTRACT_ADDRESS } from '@rsdk-features/instant-trades/dexes/polygon/algebra/constants/swap-router-contract-data';
import { RubicSdkError } from 'src/common';
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
