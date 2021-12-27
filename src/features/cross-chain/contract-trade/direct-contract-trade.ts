import { CrossChainSupportedBlockchain } from '@features/cross-chain/constants/cross-chain-supported-blockchains';
import { ContractData } from '@features/cross-chain/contract-data/contract-data';
import { PriceTokenAmount } from '@core/blockchain/tokens/price-token-amount';
import { ContractTrade } from '@features/cross-chain/contract-trade/contract-trade';
import BigNumber from 'bignumber.js';
import { Token } from '@core/blockchain/tokens/token';

export class DirectContractTrade extends ContractTrade {
    public get fromToken(): PriceTokenAmount {
        return this.token;
    }

    public get toToken(): PriceTokenAmount {
        return this.token;
    }

    public get toAmount(): BigNumber {
        return this.token.tokenAmount;
    }

    public get toAmountWei(): BigNumber {
        return this.token.weiAmount;
    }

    public get toAmountMin(): BigNumber {
        return this.toAmount;
    }

    public get path(): ReadonlyArray<Token> {
        return [this.token];
    }

    constructor(
        public readonly blockchain: CrossChainSupportedBlockchain,
        public readonly contract: ContractData,
        private readonly token: PriceTokenAmount
    ) {
        super(blockchain, contract);
    }
}
