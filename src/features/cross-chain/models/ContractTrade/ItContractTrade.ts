import { SupportedCrossChainBlockchain } from '@features/cross-chain/constants/SupportedCrossChainBlockchain';
import { CrossChainContract } from '@features/cross-chain/cross-chain-contract/cross-chain-contract';
import { ContractTrade } from '@features/cross-chain/models/ContractTrade/ContractTrade';
import BigNumber from 'bignumber.js';
import { PriceTokenAmount } from '@core/blockchain/tokens/price-token-amount';
import { Pure } from '@common/decorators/pure.decorator';
import { UniswapV2AbstractTrade } from '@features/swap/trades/common/uniswap-v2/uniswap-v2-abstract-trade';
import { Token } from '@core/blockchain/tokens/token';

export class ItContractTrade extends ContractTrade {
    public get fromToken(): PriceTokenAmount {
        return this.instantTrade.from;
    }

    public get toToken(): PriceTokenAmount {
        return this.instantTrade.to;
    }

    public get toAmount(): BigNumber {
        return this.instantTrade.to.tokenAmount;
    }

    public get toAmountWei(): BigNumber {
        return this.instantTrade.to.weiAmount;
    }

    @Pure
    public get toAmountMin(): BigNumber {
        return this.toAmount.multipliedBy(1 - this.slippageTolerance);
    }

    public get path(): ReadonlyArray<Token> {
        return this.instantTrade.path;
    }

    constructor(
        public readonly blockchain: SupportedCrossChainBlockchain,
        public readonly contract: CrossChainContract,
        public readonly slippageTolerance: number,
        private readonly instantTrade: UniswapV2AbstractTrade
    ) {
        super(blockchain, contract);
    }
}
