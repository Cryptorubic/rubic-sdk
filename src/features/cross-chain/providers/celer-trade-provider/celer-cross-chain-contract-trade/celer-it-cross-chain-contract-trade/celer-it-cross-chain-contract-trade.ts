import { BlockchainName, BlockchainsInfo, PriceTokenAmount } from 'src/core';
import { UniswapV2AbstractTrade } from '@features/instant-trades/dexes/common/uniswap-v2-abstract/uniswap-v2-abstract-trade';
import { CrossChainSupportedInstantTrade } from '@features/cross-chain/providers/common/models/cross-chain-supported-instant-trade';
import { CrossChainInstantTrade } from '@features/cross-chain/providers/rubic-trade-provider/rubic-cross-chain-contract-trade/common/cross-chain-instant-trade';
import { CrossChainUniswapV2Trade } from '@features/cross-chain/providers/rubic-trade-provider/rubic-cross-chain-contract-trade/rubic-it-cross-chain-contract-trade/rubic-cross-chain-instant-trade/cross-chain-uniswap-v2-trade';
import { CelerCrossChainContractTrade } from '@features/cross-chain/providers/celer-trade-provider/celer-cross-chain-contract-trade/celer-cross-chain-contract-trade';
import BigNumber from 'bignumber.js';
import { CelerCrossChainContractData } from '@features/cross-chain/providers/celer-trade-provider/celer-cross-chain-contract-data';

export class CelerItCrossChainContractTrade extends CelerCrossChainContractTrade {
    public readonly fromToken: PriceTokenAmount;

    public readonly toToken: PriceTokenAmount;

    public readonly toTokenAmountMin: BigNumber;

    private readonly crossChainInstantTrade: CrossChainInstantTrade;

    constructor(
        blockchain: BlockchainName,
        contract: CelerCrossChainContractData,
        providerIndex: number,
        public readonly slippage: number,
        private readonly instantTrade: CrossChainSupportedInstantTrade
    ) {
        super(blockchain, contract, providerIndex);
        this.fromToken = this.instantTrade.from;
        this.toToken = this.instantTrade.to;
        this.toTokenAmountMin = this.toToken.tokenAmount.multipliedBy(1 - this.slippage);
        this.crossChainInstantTrade = this.getTrade();
    }

    protected getFirstPath(): string[] | string {
        return this.crossChainInstantTrade.getFirstPath();
    }

    public getSecondPath(): string[] {
        return this.crossChainInstantTrade.getSecondPath();
    }

    protected modifyArgumentsForProvider(
        methodArguments: unknown[][],
        walletAddress: string
    ): Promise<void> {
        return this.crossChainInstantTrade.modifyArgumentsForProvider(
            methodArguments,
            walletAddress
        );
    }

    public getCelerSourceTrade(): unknown[] | unknown {
        return Object.values(this.crossChainInstantTrade.getCelerSourceObject(this.slippage));
    }

    public getCelerDestionationTrade(integratorAddress: string): unknown[] {
        return Object.values(
            this.crossChainInstantTrade.getCelerDestinationObject(this.slippage, integratorAddress)
        );
    }

    private getTrade(): CrossChainInstantTrade {
        return new CrossChainUniswapV2Trade(this.instantTrade as UniswapV2AbstractTrade);
        // if (this.instantTrade instanceof UniswapV2AbstractTrade) {
        //     return new CrossChainUniswapV2Trade(this.instantTrade);
        // }
        throw new Error('[RUBIC SDK] Provider is not allowd.');
        // @TODO Add other providers.
        // if (this.instantTrade instanceof OneinchTrade) {
        //     return new CrossChainOneinchTrade(this.instantTrade);
        // }
        // if (this.instantTrade instanceof UniswapV3AbstractTrade) {
        //     return new CrossChainUniswapV3Trade(this.instantTrade);
        // }
        // return new CrossChainAlgebraTrade(this.instantTrade);
    }

    /**
     * Returns method's arguments to use in source network.
     */
    public async getMethodArguments(
        toContractTrade: CelerCrossChainContractTrade,
        walletAddress: string,
        providerAddress: string,
        maxSlippage?: number
    ): Promise<unknown[]> {
        console.debug('[MAX SLIPPAGE]', maxSlippage);
        const receiver = toContractTrade.contract.address || walletAddress || providerAddress;
        console.debug('[RECEIVER]', receiver);
        const tokenInAmountAbsolute = this.fromToken.stringWeiAmount;
        console.debug('[tokenInAmountAbsolute]', tokenInAmountAbsolute);
        const targetChainId = BlockchainsInfo.getBlockchainByName(
            toContractTrade.toToken.blockchain
        ).id;
        console.debug('[targetChainId]', targetChainId);
        const source = await this.getCelerSourceTrade();
        console.debug('[source]', source);
        const destination = toContractTrade.getCelerDestionationTrade(providerAddress);
        console.debug('[destination]', destination);

        return [receiver, tokenInAmountAbsolute, targetChainId, source, destination, maxSlippage];
    }
}
