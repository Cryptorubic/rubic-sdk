import { CrossChainSupportedBlockchain } from '@features/cross-chain/constants/cross-chain-supported-blockchains';
import { ContractData } from '@features/cross-chain/contract-data/contract-data';
import { ContractTrade } from '@features/cross-chain/contract-trade/contract-trade';
import BigNumber from 'bignumber.js';
import { PriceTokenAmount } from '@core/blockchain/tokens/price-token-amount';
import { Pure } from '@common/decorators/pure.decorator';
import { UniswapV2AbstractTrade } from '@features/swap/dexes/common/uniswap-v2-abstract/uniswap-v2-abstract-trade';
import { Token } from '@core/blockchain/tokens/token';
import { Web3Pure } from 'src/core';

export class InstantTradeContractTrade extends ContractTrade {
    public get fromToken(): PriceTokenAmount {
        return this.instantTrade.from;
    }

    public get toToken(): PriceTokenAmount {
        return this.instantTrade.to;
    }

    @Pure
    public get toTokenAmountMin(): BigNumber {
        return this.toToken.tokenAmount.multipliedBy(1 - this.slippageTolerance);
    }

    public get path(): ReadonlyArray<Token> {
        return this.instantTrade.path;
    }

    constructor(
        blockchain: CrossChainSupportedBlockchain,
        contract: ContractData,
        providerIndex: number,
        public readonly slippageTolerance: number,
        private readonly instantTrade: UniswapV2AbstractTrade
    ) {
        super(blockchain, contract, providerIndex);
    }

    protected getFirstPath(): string[] {
        return this.instantTrade.wrappedPath.map(token => token.address);
    }

    protected getSecondPath(): string[] {
        return this.instantTrade.wrappedPath.map(token => Web3Pure.addressToBytes32(token.address));
    }
}
