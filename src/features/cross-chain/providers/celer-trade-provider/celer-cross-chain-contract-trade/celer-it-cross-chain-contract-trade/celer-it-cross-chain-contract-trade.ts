import { BlockchainsInfo } from 'src/core';
import { UniswapV2AbstractTrade } from '@rsdk-features/instant-trades/dexes/common/uniswap-v2-abstract/uniswap-v2-abstract-trade';
import { CrossChainSupportedInstantTrade } from '@rsdk-features/cross-chain/providers/common/celer-rubic/models/cross-chain-supported-instant-trade';
import { CrossChainInstantTrade } from '@rsdk-features/cross-chain/providers/rubic-trade-provider/rubic-cross-chain-contract-trade/common/cross-chain-instant-trade';
import { CrossChainUniswapV2Trade } from '@rsdk-features/cross-chain/providers/rubic-trade-provider/rubic-cross-chain-contract-trade/rubic-it-cross-chain-contract-trade/rubic-cross-chain-instant-trade/cross-chain-uniswap-v2-trade';
import { CelerCrossChainContractTrade } from '@rsdk-features/cross-chain/providers/celer-trade-provider/celer-cross-chain-contract-trade/celer-cross-chain-contract-trade';
import BigNumber from 'bignumber.js';
import { CelerCrossChainContractData } from '@rsdk-features/cross-chain/providers/celer-trade-provider/celer-cross-chain-contract-data';
import { UniswapV3AbstractTrade } from '@rsdk-features/instant-trades/dexes/common/uniswap-v3-abstract/uniswap-v3-abstract-trade';
import { CrossChainOneinchTrade } from '@rsdk-features/cross-chain/providers/rubic-trade-provider/rubic-cross-chain-contract-trade/rubic-it-cross-chain-contract-trade/rubic-cross-chain-instant-trade/cross-chain-oneinch-trade';
import { CrossChainAlgebraTrade } from '@rsdk-features/cross-chain/providers/rubic-trade-provider/rubic-cross-chain-contract-trade/rubic-it-cross-chain-contract-trade/rubic-cross-chain-instant-trade/cross-chain-algebra-trade';
import { OneinchTrade } from 'src/features';
import { CrossChainUniswapV3Trade } from '@rsdk-features/cross-chain/providers/rubic-trade-provider/rubic-cross-chain-contract-trade/rubic-it-cross-chain-contract-trade/rubic-cross-chain-instant-trade/cross-chain-uniswap-v3-trade';
import { PriceTokenAmount } from 'src/common';
import { EvmBlockchainName } from 'src/core/blockchain/models/blockchain-name';

export class CelerItCrossChainContractTrade extends CelerCrossChainContractTrade {
    public readonly fromToken: PriceTokenAmount<EvmBlockchainName>;

    public readonly toToken: PriceTokenAmount<EvmBlockchainName>;

    public readonly toTokenAmountMin: BigNumber;

    private readonly crossChainInstantTrade: CrossChainInstantTrade;

    constructor(
        blockchain: EvmBlockchainName,
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
        return Object.values(this.crossChainInstantTrade.getCelerSourceObject());
    }

    public getCelerDestinationTrade(integratorAddress: string, receiverAddress: string): unknown[] {
        return Object.values(
            this.crossChainInstantTrade.getCelerDestinationObject(
                integratorAddress,
                receiverAddress
            )
        );
    }

    private getTrade(): CrossChainInstantTrade {
        if (this.instantTrade instanceof UniswapV2AbstractTrade) {
            return new CrossChainUniswapV2Trade(this.instantTrade);
        }
        if (this.instantTrade instanceof OneinchTrade) {
            return new CrossChainOneinchTrade(this.instantTrade);
        }
        if (this.instantTrade instanceof UniswapV3AbstractTrade) {
            return new CrossChainUniswapV3Trade(this.instantTrade);
        }
        return new CrossChainAlgebraTrade(this.instantTrade);
    }

    /**
     * Returns method's arguments to use in source network.
     */
    public async getMethodArguments(
        toContractTrade: CelerCrossChainContractTrade,
        walletAddress: string,
        providerAddress: string,
        options: {
            maxSlippage: number;
            receiverAddress: string;
        }
    ): Promise<unknown[]> {
        const receiver = toContractTrade.contract.address || walletAddress;
        const tokenInAmountAbsolute = this.fromToken.stringWeiAmount;
        const targetChainId = BlockchainsInfo.getBlockchainByName(
            toContractTrade.toToken.blockchain
        ).id;
        const source = await this.getCelerSourceTrade();
        const destination = toContractTrade.getCelerDestinationTrade(
            providerAddress,
            options.receiverAddress
        );

        return [
            receiver,
            tokenInAmountAbsolute,
            targetChainId,
            source,
            destination,
            options.maxSlippage
        ];
    }
}
