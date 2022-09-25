import { RubicSdkError } from 'src/common/errors';
import { oneinchApiParams } from 'src/features/instant-trades/providers/dexes/abstract/oneinch-abstract/constants';
import { CelerCrossChainSupportedBlockchain } from 'src/features/cross-chain/providers/celer-trade-provider/models/celer-cross-chain-supported-blockchain';
import { InchCelerSwapInfo } from 'src/features/cross-chain/providers/celer-trade-provider/celer-cross-chain-contract-trade/models/inch-celer-swap-info';
import { wrappedNative } from 'src/features/cross-chain/providers/celer-trade-provider/constants/wrapped-native';
import { CrossChainInstantTrade } from 'src/features/cross-chain/providers/celer-trade-provider/celer-cross-chain-contract-trade/celer-it-cross-chain-contract-trade/cross-chain-instant-trade/cross-chain-instant-trade';
import { DestinationCelerSwapInfo } from 'src/features/cross-chain/providers/celer-trade-provider/celer-cross-chain-contract-trade/models/destination-celer-swap-info';
import { OneinchTrade } from 'src/features/instant-trades/providers/dexes/abstract/oneinch-abstract/oneinch-trade';
import { EvmWeb3Pure } from 'src/core/blockchain/web3-pure/typed-web3-pure/evm-web3-pure';

export class CrossChainOneinchTrade implements CrossChainInstantTrade {
    readonly defaultDeadline = 999999999999999;

    constructor(private readonly instantTrade: OneinchTrade) {}

    public getFirstPath(): string {
        if (!this.instantTrade.path?.[0]) {
            throw new RubicSdkError('Instant trade path has to be defined');
        }
        return this.instantTrade.path[0].address;
    }

    public getSecondPath(): string[] {
        return this.instantTrade.wrappedPath.map(token =>
            EvmWeb3Pure.addressToBytes32(token.address)
        );
    }

    public async modifyArgumentsForProvider(
        methodArguments: unknown[][],
        walletAddress: string
    ): Promise<void> {
        const { data } = await this.instantTrade.encode({ fromAddress: walletAddress });
        if (!methodArguments?.[0]) {
            throw new RubicSdkError('Method arguments array must not be empty');
        }
        methodArguments[0].push(data);
    }

    public getCelerSourceObject(): InchCelerSwapInfo {
        if (!this.instantTrade.transactionData) {
            throw new RubicSdkError(`Can't estimate 1inch trade`);
        }
        const dex = this.instantTrade.contractAddress;
        const [tokenIn, ...restPath] = this.instantTrade.path.map(token => token.address);
        const isOneInchNative =
            oneinchApiParams.nativeAddress === tokenIn || tokenIn === EvmWeb3Pure.EMPTY_ADDRESS;
        const fromBlockchain = this.instantTrade.from
            .blockchain as CelerCrossChainSupportedBlockchain;
        const firstToken = isOneInchNative ? wrappedNative[fromBlockchain] : tokenIn;
        if (!firstToken) {
            throw new RubicSdkError('First token has to be defined');
        }

        const secondToken = restPath?.pop();
        if (!secondToken) {
            throw new RubicSdkError('Second token has to be defined');
        }

        const path = [firstToken, secondToken];

        const amountOutMinimum = this.instantTrade.toTokenAmountMin.stringWeiAmount;

        return { dex, path, data: this.instantTrade.transactionData, amountOutMinimum };
    }

    public getCelerDestinationObject(): DestinationCelerSwapInfo {
        throw Error('[RUBIC SDK] 1Inch is not supported as target provider yet.');
    }
}
