import { Asset, RangoClient } from 'rango-sdk-basic';
import { PriceToken, PriceTokenAmount } from 'src/common/tokens';
import { BlockchainName } from 'src/core/blockchain/models/blockchain-name';

// import { RequiredCrossChainOptions } from '../../models/cross-chain-options';
import { CROSS_CHAIN_TRADE_TYPE, CrossChainTradeType } from '../../models/cross-chain-trade-type';
import { CrossChainProvider } from '../common/cross-chain-provider';
import { CalculationResult } from '../common/models/calculation-result';
import { RubicStep } from '../common/models/rubicStep';
import { TransformedCalculationQueryParams } from './model/rango-provider-class-types';

export class RangoCrossChainProvider extends CrossChainProvider {
    public type: CrossChainTradeType = CROSS_CHAIN_TRADE_TYPE.RANGO;

    private readonly API_KEY = 'a24ca428-a18e-4e84-b57f-edb3e2a5bf13';

    private readonly API_BASE_URL = 'https://api.rango.exchange/';

    private rangoClient!: RangoClient;

    private rangoSupportedBlockchains!: BlockchainName[];

    constructor() {
        super();
    }

    private async initRango(): Promise<void> {
        this.rangoClient = new RangoClient(this.API_KEY);
        this.rangoClient.meta({ blockchains: [''] });
        const swap = await this.rangoClient.swap({
            swappers: [],
            from: {
                blockchain: '',
                address: null,
                symbol: ''
            },
            to: {
                blockchain: '',
                address: null,
                symbol: ''
            },
            amount: '',
            fromAddress: '',
            toAddress: '',
            slippage: ''
        });
        console.log(swap);
    }

    public isSupportedBlockchain(blockchain: BlockchainName): boolean {
        return this.rangoSupportedBlockchains.some(
            supportedBlockchain => supportedBlockchain === blockchain
        );
    }

    public async calculate(
        from: PriceTokenAmount<BlockchainName>,
        toToken: PriceToken<BlockchainName>
        // options: RequiredCrossChainOptions
    ): Promise<CalculationResult> {
        this.rangoSupportedBlockchains = await this.getSupportedBlockchains();
        if (!this.areSupportedBlockchains(from.blockchain, toToken.blockchain)) {
            throw Error('asd');
        }
        const { fromAsset, toAsset, amountQueryParam } = this.transformCalculationParams(
            from,
            toToken
        );
        const res = await this.rangoClient.quote({
            from: fromAsset,
            to: toAsset,
            amount: amountQueryParam
        });
        console.log(res);
        return {} as unknown as Promise<CalculationResult>;
    }

    /**
     *@description Transform parameters to required view for Rango
     *@returns Return object with params for `quote` method in rango-sdk to get best trade in `calculate` method
     */
    private transformCalculationParams(
        from: PriceTokenAmount<BlockchainName>,
        toToken: PriceToken<BlockchainName>
    ): TransformedCalculationQueryParams {
        const fromAsset = {
            blockchain: from.blockchain,
            address: from.address,
            symbol: from.symbol
        } as Asset;
        const toAsset = {
            blockchain: toToken.blockchain,
            address: toToken.address,
            symbol: toToken.symbol
        } as Asset;
        const amountQueryParam = from.tokenAmount.toString();
        return { fromAsset, toAsset, amountQueryParam };
    }

    private async getSupportedBlockchains(): Promise<BlockchainName[]> {
        const res = await this.rangoClient.chains();
        const supportedBlockchains = res.map(meta => meta.name) as BlockchainName[];
        return supportedBlockchains;
    }

    protected getRoutePath(...options: unknown[]): Promise<RubicStep[]> {
        console.log(options);
        return [] as unknown as Promise<RubicStep[]>;
    }
}
