import { CelerCrossChainContractData } from 'src/features/cross-chain/providers/celer-trade-provider/celer-cross-chain-contract-data';
import { EvmBlockchainName } from 'src/core/blockchain/models/blockchain-name';
import { CelerCrossChainContractTrade } from 'src/features/cross-chain/providers/celer-trade-provider/celer-cross-chain-contract-trade/celer-cross-chain-contract-trade';
import { PriceTokenAmount } from 'src/common/tokens';
import { OneinchTrade } from 'src/features/instant-trades/dexes/common/oneinch-common/oneinch-trade';
import { UniswapV3AbstractTrade } from 'src/features/instant-trades/dexes/common/uniswap-v3-abstract/uniswap-v3-abstract-trade';
import { CrossChainSupportedInstantTrade } from 'src/features/cross-chain/providers/celer-trade-provider/models/cross-chain-supported-instant-trade';
import { UniswapV2AbstractTrade } from 'src/features/instant-trades/dexes/common/uniswap-v2-abstract/uniswap-v2-abstract-trade';
import BigNumber from 'bignumber.js';
import { blockchainId } from 'src/core/blockchain/utils/blockchains-info/constants/blockchain-id';
import { CrossChainInstantTrade } from 'src/features/cross-chain/providers/celer-trade-provider/celer-cross-chain-contract-trade/celer-it-cross-chain-contract-trade/cross-chain-instant-trade/cross-chain-instant-trade';
import { CelerCrossChainSupportedBlockchain } from 'src/features/cross-chain/providers/celer-trade-provider/models/celer-cross-chain-supported-blockchain';
import { CrossChainUniswapV2Trade } from 'src/features/cross-chain/providers/celer-trade-provider/celer-cross-chain-contract-trade/celer-it-cross-chain-contract-trade/cross-chain-instant-trade/cross-chain-uniswap-v2-trade';
import { CrossChainOneinchTrade } from 'src/features/cross-chain/providers/celer-trade-provider/celer-cross-chain-contract-trade/celer-it-cross-chain-contract-trade/cross-chain-instant-trade/cross-chain-oneinch-trade';
import { CrossChainAlgebraTrade } from 'src/features/cross-chain/providers/celer-trade-provider/celer-cross-chain-contract-trade/celer-it-cross-chain-contract-trade/cross-chain-instant-trade/cross-chain-algebra-trade';
import { CrossChainUniswapV3Trade } from 'src/features/cross-chain/providers/celer-trade-provider/celer-cross-chain-contract-trade/celer-it-cross-chain-contract-trade/cross-chain-instant-trade/cross-chain-uniswap-v3-trade';

export class CelerItCrossChainContractTrade extends CelerCrossChainContractTrade {
    public readonly fromToken: PriceTokenAmount<EvmBlockchainName>;

    public readonly toToken: PriceTokenAmount<EvmBlockchainName>;

    public readonly toTokenAmountMin: BigNumber;

    private readonly crossChainInstantTrade: CrossChainInstantTrade;

    constructor(
        blockchain: CelerCrossChainSupportedBlockchain,
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
        const targetChainId = blockchainId[toContractTrade.toToken.blockchain];
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
