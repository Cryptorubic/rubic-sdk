import { RubicSdkError } from 'src/common/errors';
import { oneinchApiParams } from 'src/features/on-chain/providers/dexes/abstract/oneinch-abstract/constants';
import { CelerCrossChainSupportedBlockchain } from 'src/features/cross-chain/providers/celer-provider/models/celer-cross-chain-supported-blockchain';
import { InchCelerSwapInfo } from 'src/features/cross-chain/providers/celer-provider/celer-contract-trade/models/inch-celer-swap-info';
import { wrappedNative } from 'src/features/cross-chain/providers/celer-provider/constants/wrapped-native';
import { CelerOnChainTrade } from 'src/features/cross-chain/providers/celer-provider/celer-contract-trade/celer-on-chain-contract-trade/celer-on-chain-trade/celer-on-chain-trade';
import { DestinationCelerSwapInfo } from 'src/features/cross-chain/providers/celer-provider/celer-contract-trade/models/destination-celer-swap-info';
import { OneinchTrade } from 'src/features/on-chain/providers/dexes/abstract/oneinch-abstract/oneinch-trade';
import { EvmWeb3Pure } from 'src/core/blockchain/web3-pure/typed-web3-pure/evm-web3-pure';

export class CelerOneinchTrade implements CelerOnChainTrade {
    readonly defaultDeadline = 999999999999999;

    constructor(private readonly oneinchTrade: OneinchTrade) {}

    public getFirstPath(): string {
        if (!this.oneinchTrade.path?.[0]) {
            throw new RubicSdkError('On-chain trade path has to be defined');
        }
        return this.oneinchTrade.path[0].address;
    }

    public getSecondPath(): string[] {
        return this.oneinchTrade.wrappedPath.map(token =>
            EvmWeb3Pure.addressToBytes32(token.address)
        );
    }

    public async modifyArgumentsForProvider(
        methodArguments: unknown[][],
        walletAddress: string
    ): Promise<void> {
        const { data } = await this.oneinchTrade.encode({ fromAddress: walletAddress });
        if (!methodArguments?.[0]) {
            throw new RubicSdkError('Method arguments array must not be empty');
        }
        methodArguments[0].push(data);
    }

    public getCelerSourceObject(): InchCelerSwapInfo {
        if (!this.oneinchTrade.transactionData) {
            throw new RubicSdkError(`Can't estimate 1inch trade`);
        }
        const dex = this.oneinchTrade.contractAddress;
        const [tokenIn, ...restPath] = this.oneinchTrade.path.map(token => token.address);
        const isOneInchNative =
            oneinchApiParams.nativeAddress === tokenIn || tokenIn === EvmWeb3Pure.EMPTY_ADDRESS;
        const fromBlockchain = this.oneinchTrade.from
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

        const amountOutMinimum = this.oneinchTrade.toTokenAmountMin.stringWeiAmount;

        return { dex, path, data: this.oneinchTrade.transactionData, amountOutMinimum };
    }

    public getCelerDestinationObject(): DestinationCelerSwapInfo {
        throw Error('[RUBIC SDK] 1Inch is not supported as target provider yet.');
    }
}
