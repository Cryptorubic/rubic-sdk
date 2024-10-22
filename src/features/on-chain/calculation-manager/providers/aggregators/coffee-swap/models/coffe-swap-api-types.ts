import { PriceToken, PriceTokenAmount } from 'src/common/tokens';
import { TonBlockchainName } from 'src/core/blockchain/models/blockchain-name';

export interface CofeeQuoteParams {
    srcToken: PriceTokenAmount<TonBlockchainName>;
    dstToken: PriceToken<TonBlockchainName>;
    walletAddress: string;
}

export interface CoffeeQuoteResponse {
    input_token: object;
    output_token: object;
    input_amount: number;
    output_amount: number;
    input_usd: number;
    output_usd: number;
    recommended_gas: number;
    price_impact: number;
    paths: CoffeeRoutePath[];
}

export interface CoffeeSwapDataParams {
    paths: CoffeeRoutePath[];
}

export interface CoffeeSwapDataResponse {
    route_id: number;
    transactions: Array<{
        address: string;
        value: string;
        cell: string;
        send_mode: number;
        query_id: number;
    }>;
}

export interface CoffeeRoutePath {
    blockchain: 'ton';
    dex: 'dedust' | 'stonfi';
    input_token: CoffeeTokenInfo;
    output_token: CoffeeTokenInfo;
    pool_address: string;
    recommended_gas: number;
    average_gas: number;
    swap: {
        input_amount: number;
        output_amount: number;
    };
    next?: CoffeeRoutePath[];
}

export interface CoffeeTokenInfo {
    address: {
        blockchain: 'ton';
        address: string;
    };
    metadata: {
        name: string;
        symbol: string;
        decimals: number;
        listed: boolean;
        image_url: string;
    };
}
