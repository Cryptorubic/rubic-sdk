import { CelerCrossChainContractData } from 'src/features/cross-chain/calculation-manager/providers/celer-provider/celer-cross-chain-contract-data';
import { EvmBlockchainName } from 'src/core/blockchain/models/blockchain-name';
import { CelerContractTrade } from 'src/features/cross-chain/calculation-manager/providers/celer-provider/celer-contract-trade/celer-contract-trade';
import { PriceTokenAmount } from 'src/common/tokens';
import { OneinchTrade } from 'src/features/on-chain/calculation-manager/providers/dexes/common/oneinch-abstract/oneinch-trade';
import { UniswapV3AbstractTrade } from 'src/features/on-chain/calculation-manager/providers/dexes/common/uniswap-v3-abstract/uniswap-v3-abstract-trade';
import { CelerSupportedOnChainTrade } from 'src/features/cross-chain/calculation-manager/providers/celer-provider/models/celer-supported-on-chain-trade';
import { UniswapV2AbstractTrade } from 'src/features/on-chain/calculation-manager/providers/dexes/common/uniswap-v2-abstract/uniswap-v2-abstract-trade';
import BigNumber from 'bignumber.js';
import { blockchainId } from 'src/core/blockchain/utils/blockchains-info/constants/blockchain-id';
import { CelerOnChainTrade } from 'src/features/cross-chain/calculation-manager/providers/celer-provider/celer-contract-trade/celer-on-chain-contract-trade/celer-on-chain-trade/celer-on-chain-trade';
import { CelerCrossChainSupportedBlockchain } from 'src/features/cross-chain/calculation-manager/providers/celer-provider/models/celer-cross-chain-supported-blockchain';
import { CelerUniswapV2Trade } from 'src/features/cross-chain/calculation-manager/providers/celer-provider/celer-contract-trade/celer-on-chain-contract-trade/celer-on-chain-trade/celer-uniswap-v2-trade';
import { CelerOneinchTrade } from 'src/features/cross-chain/calculation-manager/providers/celer-provider/celer-contract-trade/celer-on-chain-contract-trade/celer-on-chain-trade/celer-oneinch-trade';
import { CelerAlgebraTrade } from 'src/features/cross-chain/calculation-manager/providers/celer-provider/celer-contract-trade/celer-on-chain-contract-trade/celer-on-chain-trade/celer-algebra-trade';
import { CelerUniswapV3Trade } from 'src/features/cross-chain/calculation-manager/providers/celer-provider/celer-contract-trade/celer-on-chain-contract-trade/celer-on-chain-trade/celer-uniswap-v3-trade';

export class CelerOnChainContractTrade extends CelerContractTrade {
    public readonly fromToken: PriceTokenAmount<EvmBlockchainName>;

    public readonly toToken: PriceTokenAmount<EvmBlockchainName>;

    public readonly toTokenAmountMin: BigNumber;

    private readonly celerOnChainTrade: CelerOnChainTrade;

    constructor(
        blockchain: CelerCrossChainSupportedBlockchain,
        contract: CelerCrossChainContractData,
        providerIndex: number,
        public readonly slippage: number,
        private readonly onChainTrade: CelerSupportedOnChainTrade
    ) {
        super(blockchain, contract, providerIndex);
        this.fromToken = this.onChainTrade.from;
        this.toToken = this.onChainTrade.to;
        this.toTokenAmountMin = this.toToken.tokenAmount.multipliedBy(1 - this.slippage);
        this.celerOnChainTrade = this.getTrade();
    }

    public getCelerSourceTrade(): unknown[] | unknown {
        return Object.values(this.celerOnChainTrade.getCelerSourceObject());
    }

    public getCelerDestinationTrade(integratorAddress: string, receiverAddress: string): unknown[] {
        return Object.values(
            this.celerOnChainTrade.getCelerDestinationObject(integratorAddress, receiverAddress)
        );
    }

    private getTrade(): CelerOnChainTrade {
        if (this.onChainTrade instanceof UniswapV2AbstractTrade) {
            return new CelerUniswapV2Trade(this.onChainTrade);
        }
        if (this.onChainTrade instanceof OneinchTrade) {
            return new CelerOneinchTrade(this.onChainTrade);
        }
        if (this.onChainTrade instanceof UniswapV3AbstractTrade) {
            return new CelerUniswapV3Trade(this.onChainTrade);
        }
        return new CelerAlgebraTrade(this.onChainTrade);
    }

    /**
     * Returns method's arguments to use in source network.
     */
    public async getMethodArguments(
        toContractTrade: CelerContractTrade,
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
