# Rubic SDK

> ⚠️ **Danger:** Rubic SDK is at the alpha stage. Don't use it in production code. Use Rubic sdk at your own risk. During the first quarter of 2022, a beta release is planned, in which many interfaces and types can be changed. For now, you can explore our solution and try it out in a test environment. [An example of using rubik sdk](https://github.com/Cryptorubic/rubic-sdk-usage)

## Table of contents
- [Description](#description)
  - [Supported DEX-es](#supported-dex-es)
  - [Multi-Chain swaps supported blockchains](#multi-chain-swaps-supported-blockchains)
- [Installation](#installation)
  - [Installation with cdn](#installation-with-cdn)
  - [Installation with npm and webpack](#installation-with-npm-and-webpack-react-)
  - [Installation with npm for angular](#installation-with-npm-for-angular)
- [Usage](#usage)
  - [Get started after cdn installation](#get-started-after-cdn-installation)
  - [Get started after npm installation](#get-started-after-npm-installation)
  - [Get started with cross-chain swaps](#get-started-with-cross-chain-swaps)
  - [Get started with tokens](#get-started-with-tokens)
- [API](#api)
  - [Core](#core)
    - [SDK.createSDK static method](#sdkcreatesdk-static-method)
    - [sdk.updateConfiguration method](#sdkupdateconfiguration-method)
    - [sdk.instantTrades readonly field](#sdkinstanttrades-readonly-field)
    - [sdk.crossChain readonly field](#sdkcrosschain-readonly-field)
    - [sdk.tokens readonly field](#sdktokens-readonly-field)
    - [sdk.web3PublicService readonly field](#sdkweb3publicservice-readonly-field)
    - [sdk.web3Private readonly field](#sdkweb3private-readonly-field)
    - [sdk.gasPriceApi readonly field](#sdkgaspriceapi-readonly-field)
    - [sdk.cryptoPriceApi readonly field](#sdkcryptopriceapi-readonly-field)
  - [Instant Trades Manager](#instant-trades-manager)
    - [sdk.instantTrades.calculateTrade method](#sdkinstanttradescalculatetrade-method)
    - [sdk.instantTrades.blockchainTradeProviders readonly field](#sdkinstanttradesblockchaintradeproviders-readonly-field)
  - [Instant Trade](#instant-trade)
    - [instantTrade.swap method](#instanttradeswap-method)
    - [instantTrade.encode method](#instanttradeencode-method)
    - [instantTrade.needApprove method](#instanttradeneedapprove-method)
    - [instantTrade.type readonly field](#instanttradetype-readonly-field)
    - [instantTrade.from readonly field](#instanttradefrom-readonly-field)
    - [instantTrade.to readonly field](#instanttradeto-readonly-field)
    - [instantTrade.gasFeeInfo mutable field](#instanttradegasfeeinfo-mutable-field)
    - [instantTrade.slippageTolerance mutable field](#instanttradeslippagetolerance-mutable-field)
    - [instantTrade.toTokenAmountMin getter](#instanttradetotokenamountmin-getter)
    - [instantTrade.deadlineMinutes mutable field](#instanttradedeadlineminutes-mutable-field)
    - [instantTrade.path readonly field](#instanttradepath-readonly-field)
    - [isUniswapV2LikeTrade function](#isuniswapv2liketrade-function)
    - [isUniswapV3LikeTrade function](#isuniswapv3liketrade-function)
    - [isOneInchLikeTrade function](#isoneinchliketrade-function)
    - [isZrxLikeTradeLikeTrade function](#iszrxliketradeliketrade-function)
  - [Cross Chain Manager](#cross-chain-manager)
    - [sdk.crossChain.calculateTrade method](#sdkcrosschaincalculatetrade-method)
  - [Cross Chain Trade](#cross-chain-trade)
    - [crossChainTrade.swap method](#crosschaintradeswap-method)
    - [crossChainTrade.needAapprove method](#crosschaintradeneedapprove-method)
    - [crossChainTrade.approve method](#crosschaintradeapprove-method)
    - [crossChainTrade.from readonly field](#crosschaintradefrom-readonly-field)
    - [crossChainTrade.to readonly field](#crosschaintradeto-readonly-field)
    - [crossChainTrade.toTokenAmountMin readonly field](#crosschaintradetotokenamountmin-readonly-field)
    - [crossChainTrade.estimatedGas getter](#crosschaintradeestimatedgas-getter)
    - [crossChainTrade.priceImpactData getter](#crosschaintradepriceimpactdata-getter)
  - [Tokens](#tokens-manager)
    - [Tokens Manager](#tokens-manager)
      - [tokensManager.createTokenFromStruct method](#tokensmanagercreatetokenfromstruct-method)
      - [tokensManager.createToken method](#tokensmanagercreatetoken-method)
      - [tokensManager.createTokensFromStructs method](#tokensmanagercreatetokensfromstructs-method)
      - [tokensManager.createTokens method](#tokensmanagercreatetokens-method)
      - [tokensManager.createPriceTokenFromStruct method](#tokensmanagercreatepricetokenfromstruct-method)
      - [tokensManager.createPriceToken method](#tokensmanagercreatepricetoken-method)
      - [tokensManager.createPriceTokenAmountFromStruct method](#tokensmanagercreatepricetokenamountfromstruct-method)
      - [tokensManager.createPriceTokenAmount method](#tokensmanagercreatepricetokenamount-method)
    - [Token](#token)
      - [token fields](#token-fields)
      - [token.isNative method](#tokenisnative-method)
      - [token.isEqualTo method](#tokenisequalto-method)
      - [token.clone method](#tokenclone-method)
    - [PriceToken](#pricetoken)
      - [priceToken.asStruct getter](#pricetokenasstruct-getter)
      - [priceToken.getAndUpdateTokenPrice method](#pricetokengetandupdatetokenprice-method)
      - [priceToken.cloneAndCreate](#pricetokencloneandcreate)
    - [PriceTokenAmount](#pricetokenamount)
      - [priceTokenAmount.weiAmount getter](#pricetokenamountweiamount-getter)
      - [priceTokenAmount.stringWeiAmount getter](#pricetokenamountstringweiamount-getter)
      - [priceTokenAmount.tokenAmount getter](#pricetokenamounttokenamount-getter)
      - [priceTokenAmount.weiAmountMinusSlippage method](#pricetokenamountweiamountminusslippage-method)
      - [priceTokenAmount.weiAmountPlusSlippage method](#pricetokenamountweiamountplusslippage-method)
      - [priceTokenAmount.calculatePriceImpactPercent method](#pricetokenamountcalculatepriceimpactpercent-method)

## Description
In dApps a lot of business logic is often concentrated on the frontend for interacting with the blockchain. This SDK is built on the basis of [Rubic](https://github.com/Cryptorubic/rubic-app) multichain DeFi frontend part. SDK is a library for interacting with various dexes, as well as Rubic cross-chain swaps. It also includes a number of utilities useful when working with Ethereum.

### Supported DEX-es

- Ethereum
    - [Uniswap V2](https://uniswap.org/)
    - [Uniswap V3](https://uniswap.org/)
    - [Sushiswap](https://sushi.com/)
    - [1inch](https://app.1inch.io/)
    - [0x](https://0x.org/)
- Binance Smart Chain
    - [Pancake Swap](https://pancakeswap.finance/)
    - [Sushiswap](https://sushi.com/)
    - [1inch](https://app.1inch.io/)
- Polygon
    - [Quick Swap](https://quickswap.exchange/)
    - [Sushiswap](https://sushi.com/)
    - [1inch](https://app.1inch.io/)
- Avalanche
    - [Joe](https://traderjoexyz.com/#/home)
    - [Pangolin](https://app.pangolin.exchange/#/swap)
    - [Sushiswap](https://sushi.com/)
- Fantom
    - [Spirit Swap](https://swap.spiritswap.finance/)
    - [Spooky Swap](https://spookyswap.finance/)
    - [Sushiswap](https://sushi.com/)
- Moonriver
    - [Solarbeam](https://solarbeam.io/exchange/swap)
    - [Sushiswap](https://sushi.com/)
- Harmony
    - [Sushiswap](https://sushi.com/)

### Multi-Chain swaps supported blockchains
Ethereum, Binance Smart Chain, Polygon, Avalanche, Fantom, Moonriver

## Installation
### Installation with cdn
```html
<script src="https://unpkg.com/rubic-sdk@latest/dist/rubic-sdk.min.js"></script>
```

### Installation with npm and webpack (React, ...)
1. `npm install rubic-sdk`


ℹ️️ Skip the rest of the steps if your have already installed [web3](https://github.com/ChainSafe/web3.js) in your project.


2. `npm install --save-dev http-browserify https-browserify stream-browserify crypto-browserify`
3. modify webpack.config.js. If you use create-react-app, run `npm run eject` to extract config
    1. add to `plugins`
       ```javascript
       new webpack.ProvidePlugin({
         Buffer: ['buffer', 'Buffer'],
         process: 'process/browser'
       })
       ```
    2. add `resolve.fallback`
       ```json
       "fallback": {
         "fs": false,
         "constants": false,
         "querystring": false,
         "url": false,
         "path": false,
         "os": false,
         "http": require.resolve("http-browserify"),
         "https": require.resolve("https-browserify"),
         "zlib": false,
         "stream": require.resolve("stream-browserify"),
         "crypto": require.resolve("crypto-browserify")
       }
       ```

### Installation with npm for Angular
1. `npm install rubic-sdk`


ℹ️️ Skip the rest of the steps if your have already installed [web3](https://github.com/ChainSafe/web3.js) in your project.


2. `npm install --save-dev stream-browserify assert https-browserify os-browserify stream-http crypto-browserify process buffer`
3. Modify tsconfig.json
    ```json
    {
      "compilerOptions": {
        ...
        "paths" : {
          ...
          "stream": ["./node_modules/stream-browserify"],
          "assert": ["./node_modules/assert"],
          "https": ["./node_modules/https-browserify"],
          "os": ["./node_modules/os-browserify"],
          "http": ["./node_modules/stream-http"],
          "crypto": ["./node_modules/crypto-browserify"]
      }
   }
   ```
4. Modify polyfills.ts
    ```typescript
    import Process = NodeJS.Process;
   
    export interface AppWindow extends Window {
      process: Process;
      Buffer: Buffer;
    }
   
   (window as AppWindow).process = window.process || require('process');
   (window as AppWindow).Buffer = (window as any).Buffer || require('buffer').Buffer;
   ```

## Usage

### Get started after cdn installation
```html
 <script>
        // you have to declare rpc links only for networks you will use
        const configuration = {
            rpcProviders: {
                ETH: {
                    mainRpc: '<your ethereum rpc>'
                },
                BSC: {
                    mainRpc: '<your bsc rpc>'
                }
            }
        }
        
        async function main() {
            // create SDK instance
            const sdk = await RubicSDK.SDK.createSDK(configuration);
            
            // define example trade parameters
            const blockchain = 'ETH';
            const fromTokenAddress = '0x0000000000000000000000000000000000000000';
            const fromAmount = 1;
            const toTokenAddress = '0xdac17f958d2ee523a2206206994597c13d831ec7';
            
            // calculate trades
            const trades = await sdk.instantTrades
                .calculateTrade({blockchain, address: fromTokenAddress}, fromAmount, toTokenAddress);
            
            console.log(trades);
        }

        main();
    </script>
```


### Get started after npm installation
1. Create configuration
    ```typescript
    import { BLOCKCHAIN_NAME, Configuration } from 'rubic-sdk';
    
    // you have to declare rpc links only for networks you will use
    export const configuration: Configuration = {
        rpcProviders: {
            [BLOCKCHAIN_NAME.ETHEREUM]: {
                mainRpc: '<your ethereum rpc>'
            },
            [BLOCKCHAIN_NAME.BINANCE_SMART_CHAIN]: {
                mainRpc: '<your bsc rpc>'
            }
        }
    }
    ```
2. Create sdk instance
    ```typescript
    const sdk = await SDK.createSDK(configuration);
    ```

3. Use sdk instance for trade calculation
    ```typescript
    import { BLOCKCHAIN_NAME } from 'rubic-sdk';
    
    const blockchain = BLOCKCHAIN_NAME.ETHEREUM;
    const fromTokenAddress = '0x0000000000000000000000000000000000000000'; // ETH
    const fromAmount = 1;
    const toTokenAddress = '0xdac17f958d2ee523a2206206994597c13d831ec7'; // USDT
    
    const trades = await sdk.instantTrades.calculateTrade(
        { blockchain, address: fromTokenAddress }, 
        fromAmount,
        toTokenAddress
    );
    
    // explore trades info
    Object.entries(trades).forEach(([tradeType, trade]) =>
        console.log(tradeType, `to amount: ${trade.to.tokenAmount.toFormat(3)}`)
    ) 
    ```

4. When user connects wallet (e.g. MetaMask) you should change configuration to use non-view contracts methods, and being able to use trade `swap` method. **You not have to recalculate trades after it**.
    ```typescript
    import { BLOCKCHAIN_NAME, Configuration, WalletProvider } from 'rubic-sdk';
   
    const accounts: string[] = await window.ethereum.request({ method: 'eth_requestAccounts' });
    const chainId = await window.ethereum.request({ method: 'eth_chainId' });
    
    const walletProvider: WalletProvider = {
            address: accounts[0],
            chainId,
            core: window.ethereum
        }
   
    export const configuration: Configuration = {
        rpcProviders: {
            [BLOCKCHAIN_NAME.ETHEREUM]: {
                mainRpc: '<your ethereum rpc>'
            },
            [BLOCKCHAIN_NAME.BINANCE_SMART_CHAIN]: {
                mainRpc: '<your bsc rpc>'
            }
        },
        walletProvider
    }
    await sdk.updateConfiguration(configuration);
    ```

5. Now you can use `swap` method of trade instance. Approve transaction will be sent automatically if needed.
    ```typescript
    const onConfirm = (hash: string) => console.log(hash);
    const receipt = await trades[TRADE_TYPE.UNISWAP_V2].swap({ onConfirm });
    ```
   
### Get started with cross-chain swaps
Steps 1. and 2. is the same. You can use single sdk instance for instant trades and cross-chain swaps calculations.

3. Use sdk instance for trade calculation
    ```typescript
    import { BLOCKCHAIN_NAME, BINANCE_SMART_CHAIN } from 'rubic-sdk';
    
    const fromBlockchain = BLOCKCHAIN_NAME.ETHEREUM;
    const fromTokenAddress = '0x0000000000000000000000000000000000000000'; // ETH
    const fromAmount = 1;
    const toBlockchain = BLOCKCHAIN_NAME.BINANCE_SMART_CHAIN;
    const toTokenAddress = '0xe9e7cea3dedca5984780bafc599bd69add087d56'; // BUSD
    
    const trade = await sdk.crossChain.calculateTrade(
        { blockchain: fromBlockchain, address: fromTokenAddress }, 
        fromAmount,
        { blockchain: toBlockchain, address: toTokenAddress }
    );
    ```

Step 4. is the same.

5. Now you can use `swap` method of trade instance. Approve transaction will be sent automatically if needed.
    ```typescript
    const onConfirm = (hash: string) => console.log(hash);
    const receipt = await trade.swap({ onConfirm });
    ```
   
### Get started with tokens

You can pass `type TokenBaseStruct = { blockchain: BLOCKCHAIN_NAME; address: string; }` to `calculateTrade` method,
but also you can pass `Token`. You can use SDK to create `Token`, `PriceToken`, or `PriceTokenAmount`.

```typescript
import { BLOCKCHAIN_NAME } from 'rubic-sdk';

const token = await sdk.tokens.createToken({ 
    blockchain: BLOCKCHAIN_NAME.ETHEREUM,
    address:  '0xdac17f958d2ee523a2206206994597c13d831ec7'
});

console.log(token.symbol); // USDT
console.log(token.name); // Tether USD
console.log(token.decimals); // 6
```

If you need token price, you can create `PriceToken`
```typescript
import { BLOCKCHAIN_NAME } from 'rubic-sdk';

const token = await sdk.tokens.createPriceToken({ 
    blockchain: BLOCKCHAIN_NAME.ETHEREUM,
    address:  '0xdac17f958d2ee523a2206206994597c13d831ec7'
});

console.log(token.price.toFormat(2)); // 1.00
```

You can create `PriceTokenAmount` if you want to store amount of tokens in the same object, e.g. user balance, or from/to amount:

```typescript
import BigNumber from 'bignumber.js';
import { BLOCKCHAIN_NAME } from 'rubic-sdk';

const token = await sdk.tokens.createPriceTokenAmount({
    blockchain: BLOCKCHAIN_NAME.ETHEREUM,
    address: '0xdac17f958d2ee523a2206206994597c13d831ec7',
    tokenAmount: new BigNumber(1)
});

console.log(token.tokenAmount.toNumber()); // 1
console.log(token.stringWeiAmount); // 1000000
```


## API

### Core 

#### SDK.createSDK static method
```typescript
SDK.createSDK(configuration: Configuration): Promise<SDK>
```

Creates new sdk instance. Changes dependencies of all sdk entities according to new configuration (even for entities created with other previous sdk instances).

| Parameter     | Type          | Description                                                                        |
|---------------|---------------|------------------------------------------------------------------------------------|
| configuration | Configuration | Object contains main sdk settings like .env: rpc providers links, wallet object... |

Configuration structure
```typescript
interface Configuration {
    readonly rpcProviders: Partial<Record<BLOCKCHAIN_NAME, RpcProvider>>;
    readonly walletProvider?: WalletProvider;
    readonly httpClient?: HttpClient;
}

interface RpcProvider {
    readonly mainRpc: string;
    readonly spareRpc?: string;
    readonly mainPrcTimeout?: number;
    readonly healthCheckTimeout?: number;
}

interface WalletProvider {
    readonly core: provider | Web3;
    readonly address: string;
    readonly chainId: number | string;
}
```

**Configuration description:**

| Property        | Type                                            | Description                                                                                                                                                                                                                                                                                                                                                                          | Default                              |
|-----------------|-------------------------------------------------|--------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|--------------------------------------|
| rpcProviders    | `Partial<Record<BLOCKCHAIN_NAME, RpcProvider>>` | Rpc data to connect to blockchains you will use. You have to pass rpcProvider for each blockchain you will use with sdk.                                                                                                                                                                                                                                                             | Not set.                             |
| walletProvider? | `WalletProvider`                                | Required to use `swap`, `approve` and other methods which sends transactions. But you can calculate and encode trades without `walletProvider`. Pass it when user connects wallet. Please note that address and chainId must match account address and selected chainId in the user wallet.                                                                                          | Not set.                             |
| httpClient?     | `HttpClient`                                    | You can pass you own httpClient (e.g. HttpClient in Angular) if you have it to not duplicate http clients and decrease bundle size. Please note that default axios or native js fetch clients can't be used as `HttpClient` without modifications. Your http client must return promise which will resolve with parsed response body (like Angular httpClient). See interface below. | Lazy loading axios with interceptor. |

**HttpClient interface:**

```typescript
interface HttpClient {
    post<ResponseBody>(url: string, body: Object): Promise<ResponseBody>;
    get<ResponseBody>(
        url: string,
        options?: {
            headers?: {
                [header: string]: string | string[];
            };
            params?: {
                [param: string]:
                    | string
                    | number
                    | boolean
                    | ReadonlyArray<string | number | boolean>;
            };
        }
    ): Promise<ResponseBody>;
}
```

**RpcProvider description:**

| Property            | Type     | Description                                                                                                                                                                                                                                                                                                                                                                                                                                                           | Default  |
|---------------------|----------|-----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|----------|
| mainRpc             | `string` | Rpc link. Copy it from your rpc provider (like Infura, Quicknode, Getblock, Moralis, ...) website.                                                                                                                                                                                                                                                                                                                                                                    | Not set. |
| spareRpc?           | `string` | Same as `mainRpc`. Will be used instead `mainRpc` if mainRpc is out of timeout = `mainPrcTimeout`.                                                                                                                                                                                                                                                                                                                                                                    | Not set. |
| mainPrcTimeout?     | number   | Specifies timeout **in ms** after that `mainRpc` will be replaced with `spareRpc` (if `spareRpc` is defined)                                                                                                                                                                                                                                                                                                                                                          | 10_000   |
| healthCheckTimeout? | number   | Before the `mainRpc` link is applied to the sdk, all the `mainRpc` links will be checked for operability by receiving from the blockchain and verifying the predefined data. If an error occurs during the request, the received data does not match the specified one, or the timeout is exceeded, the `mainRpc` will be replaced with a spare one. This `healthCheckTimeout` parameter allows you to set the maximum allowable timeout when checking the `mainRpc`. | 4_000    |

---

#### sdk.updateConfiguration method

```typescript
sdk.updateConfiguration(configuration: Configuration): Promise<void>
```

Updates sdk configuration and sdk entities dependencies. Call it if user connects wallet, or user changes network or account in him wallet.

---

#### sdk.instantTrades readonly field

```typescript
sdk.instantTrades: InstantTradesManager
```

Instant trades manager object. Use it to calculate and create instant trades. [See more.](#instant-trades-manager)

---

#### sdk.crossChain readonly field

```typescript
sdk.crossChain: CrossChainManager
```

Cross-chain trades manager object. Use it to calculate and create cross-chain trades. [See more.](#cross-chain-manager)

---

#### sdk.tokens readonly field

```typescript
sdk.tokens: TokensManager
```

Tokens manager object. Use it to fetch tokens data, to create new `Token`, `PriceToken`, `PriceTokenAmount` objects. [See more.](#tokens)

---

#### sdk.web3PublicService readonly field

```typescript
sdk.web3PublicService: Web3PublicService
```

Use it to get `Web3Public` instance by blockchain name to get read information from blockchain.

```typescript
const web3Public = sdk.web3PublicService.getWeb3Public(BLOCKCHAIN_NAME.ETHEREUM);
const ethBalance = await web3Public.getBalance('<user address>');
const tokenBalance = await web3Public.getBalance('<user address>', '<token address>');
```

Explore Web3Public class to see available methods.

--- 

#### sdk.web3Private readonly field

```typescript
sdk.web3Private: Web3Private
```

Use it to send transactions and execute smart contracts methods.

```typescript
const web3Private = sdk.web3Private;
const transacionReceipt = await web3Private.transferTokens('<constract address>', ',toAddress>', 1000);
```

Explore Web3Private class to see available methods.

---

#### sdk.gasPriceApi readonly field

```typescript
sdk.gasPriceApi: GasPriceApi
```

Use it to get gas price information.

```typescript
const gasPriceApi = sdk.gasPriceApi;
const gasPrice = await gasPriceApi.getGasPrice(BLOCKCHAIN_NAME.ETHEREUM);
```

Explore GasPriceApi class to see available methods.

---

#### sdk.cryptoPriceApi readonly field

```typescript
sdk.cryptoPriceApi: CoingeckoApi
```

Use it to get crypto price information.

```typescript
const cryptoPriceApi = sdk.cryptoPriceApi;
const tokenUSDPrice = await cryptoPriceApi.getErc20TokenPrice('<token address>', '<BLOCKCHAIN_NAME.>');
```

Explore CoingeckoApi class to see available methods.

---

### Instant Trades Manager 

#### sdk.instantTrades.calculateTrade method

```typescript
sdk.instantTrades.calculateTrade(
        fromToken:
            | Token
            | {
                  address: string;
                  blockchain: BLOCKCHAIN_NAME;
              },
        fromAmount: string | number,
        toToken: Token | string,
        options?: SwapManagerCalculationOptions
    ): Promise<InstantTrade[]>
```

> ℹ️️ You have to set up **rpc provider 🌐** for network in which you will calculate trade.

Method calculates instant trades parameters and estimated output amount.

**sdk.instantTrades.calculateTrade method parameters:**

| Parameter  | Type                                                               | Description                                                                                                                 |
|------------|--------------------------------------------------------------------|-----------------------------------------------------------------------------------------------------------------------------|
| fromToken  | `Token`  &#124; `{ address: string; blockchain: BLOCKCHAIN_NAME;}` | Token sell.                                                                                                                 |
| fromAmount | `string` &#124; `number`                                           | Amount in token units (**not in wei!**) to swap.                                                                            |
| toToken    | `Token` &#124; `string`                                            | Token to get. You can pass Token object, or string token address. Must has same blockchain as fromToken if passed as Token. |
| options?   | `SwapManagerCalculationOptions`                                    | Swap calculation options.                                                                                                   |

**SwapManagerCalculationOptions description:**

| Option             | Type                                                           | Description                                                                                                                                                                                                          | Default     |
|--------------------|----------------------------------------------------------------|----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|-------------|
| timeout?           | `number`                                                       | Specify trade calculation timeout in ms (same timeout for every provider separately).                                                                                                                                | 3000        |
| disabledProviders? | `TradeType[]`                                                  | Specify providers which must be ignored.                                                                                                                                                                             | []          |
| gasCalculation?    | `'disabled'` &#124; `'calculate'` &#124; `'rubicOptimisation'` | Disable estimated gas calculation, or use rubic gas optimisation to consider the gas fee when calculating route profit (works only for UniswapV2-like and UniswapV3-like providers.).                                | 'calculate' |
| disableMultihops?  | `boolean`                                                      | Disable not direct swap routes. It can help to reduce gas fee, but can worsen the exchange rate. Better use `gasCalculation = 'rubicOptiomisation'` when it is possible.                                             | false       |
| slippageTolerance? | `number`                                                       | Swap slippage in range 0 to 1. Defines minimum amount that you can get after swap. Can be changed after trade calculation for every trade separately (excluding 0x trade).                                           | 0.02        |
| deadlineMinutes?   | `number`                                                       | Transaction deadline in minutes (countdown from the transaction sending date). Will be applied only for UniswapV2-like and UniswapV3-like trades. Can be changed after trade calculation for every trade separately. | 20          |

**Returns** `Promise<InstantTrade[]>` -- list of successful calculated trades. 

---

#### sdk.instantTrades.blockchainTradeProviders readonly field

```typescript
readonly sdk.instantTrades.blockchainTradeProviders: Readonly<Record<BLOCKCHAIN_NAME, Partial<TypedTradeProviders>>
```

If you need to calculate trade with the special provider options, you can get needed provider instance in `sdk.instantTrades.blockchainTradeProviders`
and calculate trade directly via this instance.

```typescript
// calculate trade with exact output
const trade = await sdk.instantTrades.blockchainTradeProviders[BLOCKCHAIN_NAME.ETHEREUM][TRADE_TYPE.UNISWAP_V2]
  .calculateDifficultTrade(from, to, weiAmount, 'output', options);
```

---

### Instant Trade

#### instantTrade.swap method

```typescript
instantTrade.swap(options?: SwapTransactionOptions): Promise<TransactionReceipt>
```

> ℹ️️ You have to set up **wallet provider 👛** for network in which you will execute trade swap.

Method checks balance, network id correctness, and executes swap transaction.
A transaction confirmation window will open in the connected user's wallet.
If user has not enough allowance, the method will automatically send approve transaction before swap transaction.

**instantTrade.swap method parameters:**

| Parameter | Type                     | Description                          |
|-----------|--------------------------|--------------------------------------|
| options?  | `SwapTransactionOptions` | Additional swap transaction options. |

**SwapTransactionOptions description:**

| Option     | Type                     | Description                                                                                                                           | Default                                                                                                                                |
|------------|--------------------------|---------------------------------------------------------------------------------------------------------------------------------------|----------------------------------------------------------------------------------------------------------------------------------------|
| onConfirm? | `(hash: string) => void` | Callback that will be called after the user signs swap transaction.                                                                   | Not set.                                                                                                                               |
| onApprove? | `(hash: string) => void` | Callback that will be called after the user signs approve transaction. If user has enough allowance, this callback won't be called.   | Not set.                                                                                                                               |
| gasPrice?  | `string`                 | Specifies gas price **in wei** for **swap and approve** transactions. Set this parameter only if you know exactly what you are doing. | The value obtained during the calculation of the trade. If value wasn't calculated, it will calculates automatically by user's wallet. |
| gasLimit?  | `string`                 | Specifies gas limit for **swap and approve** transactions. Set this parameter only if you know exactly what you are doing.            | The value obtained during the calculation of the trade. If value wasn't calculated, it will calculates automatically by user's wallet. |

**Returns** `Promise<TransactionReceipt>` -- swap transaction receipt. Promise will be resolved, when swap transaction gets to block.

---

#### instantTrade.encode method

```typescript
instantTrade.encode(options?: EncodeTransactionOptions): Promise<TransactionConfig>
```

> ℹ️️ You have to set up **rpc provider 🌐** for trade network for which you will call encode.

If you don't want to execute transaction instantly (e.g. if you use SDK in the server-side), you can get full transaction data 
to pass it to the transaction when you need to send it, you can use `instantTrade.encode` method.

**instantTrade.encode method parameters:**

| Parameter | Type                       | Description                                                                                                      |
|-----------|----------------------------|------------------------------------------------------------------------------------------------------------------|
| options   | `EncodeTransactionOptions` | Additional options. Optional for uniswapV3-like and 0x trades, but required for uniswapV2-like and 1inch trades. |

**EncodeTransactionOptions description:**

| Option      | Type     | Description                                                                                                                                                                                                                            | Default                                                                                                                                |
|-------------|----------|----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|----------------------------------------------------------------------------------------------------------------------------------------|
| fromAddress | `string` | Not needed for uniswapV3-like and 0x trades, but required for uniswapV2-like and 1inch trades. Address of account which will executes swap transaction by encoded data. This address must has enough allowance to successfully encode. | Not set.                                                                                                                               |
| gasPrice?   | `string` | Specifies gas price **in wei** for **swap and approve** transactions. Set this parameter only if you know exactly what you are doing.                                                                                                  | The value obtained during the calculation of the trade. If value wasn't calculated, it will calculates automatically by user's wallet. |
| gasLimit?   | `string` | Specifies gas limit for **swap and approve** transactions. Set this parameter only if you know exactly what you are doing.                                                                                                             | The value obtained during the calculation of the trade. If value wasn't calculated, it will calculates automatically by user's wallet. |

**Returns** `Promise<TransactionConfig>` -- web3 transaction structure to send. 

---

#### instantTrade.needApprove method

```typescript
instantTrade.needApprove(): Promise<boolean>
```


> ℹ️️ You have to set up **rpc provider 🌐** for trade network for which you will call needApprove.

Swap method will automatically call approve if needed, but you can use methods pair `needApprove`-`approve` 
if you want to know if approve is needed before execute swap to show user double button, or swap stages in UI.

**instantTrade.needApprove Returns** `Promise<boolean>` -- True if approve required, that is user has not enough allowance. Otherwise false.

---

#### instantTrade.approve method

```typescript
instantTrade.approve(options?: BasicTransactionOptions): Promise<TransactionReceipt>
```

> ℹ️️ You have to set up **wallet provider 👛** for network in which you will execute trade swap.

Use `approve` if you want to show swap stages in UI after allowance check via `needApprove` method.

**instantTrade.approve method parameters:**

| Parameter | Type                      | Description                     |
|-----------|---------------------------|---------------------------------|
| options   | `BasicTransactionOptions` | Additional transaction options. |

**BasicTransactionOptions description:**

| Option             | Type                     | Description                                                                                                                 | Default                                                                                                                                |
|--------------------|--------------------------|-----------------------------------------------------------------------------------------------------------------------------|----------------------------------------------------------------------------------------------------------------------------------------|
| onTransactionHash? | `(hash: string) => void` | Callback that will be called after the user signs the approve transaction.                                                  |
| gasPrice?          | `string`                 | Specifies gas price **in wei** for **approve** transaction. Set this parameter only if you know exactly what you are doing. | The value obtained during the calculation of the trade. If value wasn't calculated, it will calculates automatically by user's wallet. |
| gasLimit?          | `string`                 | Specifies gas limit for **approve** transactions. Set this parameter only if you know exactly what you are doing.           | The value obtained during the calculation of the trade. If value wasn't calculated, it will calculates automatically by user's wallet. |

**Returns** `Promise<TransactionReceipt>` -- approve transaction receipt. Promise will be resolved, when swap transaction gets to block.

---

#### instantTrade.type readonly field

```typescript
readonly instantTrade.type: TradeType
```

Instant trade type (like `TRADE_TYPE.UNISWAP_V2`, `TRADE_TYPE.QUICK_SWAP`, ...).

---

#### instantTrade.from readonly field

```typescript
readonly instantTrade.from: PriceTokenAmount
```

Token to sell with price in USD per 1 token unit and selling amount.

---

#### instantTrade.to readonly field

```typescript
readonly instantTrade.to: PriceTokenAmount
```

Token to buy with price in USD per 1 token unit and estimated get amount (not to be confused with `instantTrade.toTokenAmountMin`).

---

#### instantTrade.gasFeeInfo mutable field

```typescript
instantTrade.gasFeeInfo: GasFeeInfo | null
```

where 
```typescript
interface GasFeeInfo {
    readonly gasLimit?: BigNumber;
    readonly gasPrice?: BigNumber;
    readonly gasFeeInEth?: BigNumber;
    readonly gasFeeInUsd?: BigNumber;
}
```

Information about predicted gas fee connected to this trade. Will be null if option `gasCalculation` was set as `'disabled'` when trade was calculated.
Some properties of `gasFeeInfo` can be undefined if there are errors while gas fetching.

Can be changed: just modify gasFeeInfo field.

---

#### instantTrade.slippageTolerance mutable field

```typescript
instantTrade.slippageTolerance: number
```

Swap slippage in range 0 to 1. Defines minimum amount that you can get after swap. Can be changed **(excluding 0x trade)**: just modify slippageTolerance field.

---

#### instantTrade.toTokenAmountMin getter

```typescript
instantTrade.toTokenAmountMin: PriceTokenAmount
```

Is same as `instantTrade.to`, but amount less than `instantTrade.to` by `(instantTrade.slippageTolerance * 100)` percent.


---

#### instantTrade.deadlineMinutes mutable field

```typescript
instantTrade.deadlineMinutes: number
```

> ⚠️ Is available only in uniswapV2-like and uniswapV3-like trades.

Transaction deadline in minutes (countdown from the transaction sending date). Can be changed: just modify deadlineMinutes field.

---

#### instantTrade.path readonly field

```typescript
instantTrade.path: ReadonlyArray<Token>
```

> ⚠️ Is not available for 0x trades.

Swap path. E.g. if you change ETH to LINK path might be [ETH, USDT, LINK].
Path elements is `Token`, so you can get address, symbol and other properties of each element.
If you sell, or get native coin (like ETH, BNB, MATIC, ...) in swap, `path[0]` or `path[path.length -1]` **won't** be wrapped tokens like WETH, but will be native tokens. 

---

#### isUniswapV2LikeTrade function
```typescript
function isUniswapV2LikeTrade(trade: InstantTrade): trade is UniswapV2AbstractTrade
```

Type guard checks that trade is UniswapV2AbstractTrade. Use it to parse result of `sdk.instantTrades.calculateTrade` and 
show specific uniswapV2 trade data like `deadline` and `path`, or use its specific methods.

List of uniswapV2LikeTrades/Providers:
- UniSwap V2
- SushiSwap Ethereum
- PancakeSwap
- SushiSwap Bsc
- QuickSwap
- SushiSwap Polygon
- Joe
- Pangolin
- SushiSwap Avalanche
- SpiritSwap
- SpookySwap
- SushiSwap Fantom
- SushiSwap Harmony
- Solarbeam
- SushiSwap Moonriver

---

#### isUniswapV3LikeTrade function
```typescript
function isUniswapV3LikeTrade(trade: InstantTrade): trade is UniSwapV3Trade
```

Type guard checks that trade is UniSwapV3Trade. Use it to parse result of `sdk.instantTrades.calculateTrade` and
show specific UniSwapV3 trade data, or use its specific methods. 

List of uniswapV2LikeTrades/Providers:
- UniSwapV3
- (Algebra and UniSwapV3 Polygon soon!)

--- 

#### isOneInchLikeTrade function
```typescript
function isOneInchLikeTrade(trade: InstantTrade): trade is OneinchTrade
```

Type guard checks that trade is OneinchTrade. Use it to parse result of `sdk.instantTrades.calculateTrade` and
show specific OneinchTrade trade data, or use its specific methods.

List of OneinchTrade/Providers:
- OneInch Ethereum
- OneInch Bsc
- OneInch Polygon

--- 

#### isZrxLikeTradeLikeTrade function
```typescript
function isZrxLikeTradeLikeTrade(trade: InstantTrade): trade is ZrxTrade
```

Type guard checks that trade is 0x Trade. Use it to parse result of `sdk.instantTrades.calculateTrade` and
show specific 0x Trade trade data, or use its specific methods.

List of OneinchTrade/Providers:
- 0x Ethereum
- (other blockchains for 0x soon!)

--- 

### Cross Chain Manager

> ⚠️ **Danger:** Currently, Cross Chain Manager uses dev-mode contracts. Its' logic is the same as of prod-mode contracts, but settings (such as minimum amount of tokens to sell) are different.

#### sdk.crossChain.calculateTrade method

```typescript
sdk.crossChain.calculateTrade(
        fromToken:
            | Token
            | {
              address: string;
              blockchain: BLOCKCHAIN_NAME;
            },
        fromAmount: string | number,
        toToken:
            | Token
            | {
              address: string;
              blockchain: BLOCKCHAIN_NAME;
            },
        options?: CrossChainOptions
): Promise<CrossChainTrade>
```

> ℹ️️ You have to set up **rpc provider 🌐** for network in which you will calculate trade.

Method calculates [CrossChainTrade](#cross-chain-trade).

**sdk.crossChain.calculateTrade method parameters:**

| Parameter  | Type                                                               | Description                                      |
|------------|--------------------------------------------------------------------|--------------------------------------------------|
| fromToken  | `Token`  &#124; `{ address: string; blockchain: BLOCKCHAIN_NAME;}` | Token to sell.                                   |
| fromAmount | `string` &#124; `number`                                           | Amount in token units (**not in wei!**) to swap. |
| toToken    | `Token`  &#124; `{ address: string; blockchain: BLOCKCHAIN_NAME;}` | Token to get.                                    |
| options?   | `CrossChainOptions`                                                | Swap calculation options.                        |

**CrossChainOptions description:**

| Option                | Type     | Description                                                                                                 | Default |
|-----------------------|----------|-------------------------------------------------------------------------------------------------------------|---------|
| fromSlippageTolerance | `number` | Swap slippage in range 0 to 1. Defines minimum amount after swap in **first blockchain**.                   | 0.02    |
| toSlippageTolerance   | `number` | Swap slippage in range 0 to 1. Defines minimum amount that you can get after swap in **second blockchain**. | 0.02    |

---

### Cross Chain Trade

Stores information about trade and provides method to make swap.

#### crossChainTrade.swap method

```typescript
instantTrade.swap(options?: SwapTransactionOptions): Promise<TransactionReceipt>
```

> ℹ️️ You have to set up **wallet provider 👛** for network in which you will execute trade swap.

Method checks balance, network id correctness, cross-chain contracts state and executes swap transaction.
A transaction confirmation window will open in the connected user's wallet.
If user has not enough allowance, the method will automatically send approve transaction before swap transaction.

**crossChainTrade.swap method parameters:**

| Parameter | Type                     | Description                          |
|-----------|--------------------------|--------------------------------------|
| options?  | `SwapTransactionOptions` | Additional swap transaction options. |

**SwapTransactionOptions description:**

| Option     | Type                     | Description                                                                                                                           | Default                                                                                                                                |
|------------|--------------------------|---------------------------------------------------------------------------------------------------------------------------------------|----------------------------------------------------------------------------------------------------------------------------------------|
| onConfirm? | `(hash: string) => void` | Callback that will be called after the user signs swap transaction.                                                                   | Not set.                                                                                                                               |
| onApprove? | `(hash: string) => void` | Callback that will be called after the user signs approve transaction. If user has enough allowance, this callback won't be called.   | Not set.                                                                                                                               |
| gasPrice?  | `string`                 | Specifies gas price **in wei** for **swap and approve** transactions. Set this parameter only if you know exactly what you are doing. | The value obtained during the calculation of the trade. If value wasn't calculated, it will calculates automatically by user's wallet. |
| gasLimit?  | `string`                 | Specifies gas limit for **swap and approve** transactions. Set this parameter only if you know exactly what you are doing.            | The value obtained during the calculation of the trade. If value wasn't calculated, it will calculates automatically by user's wallet. |

**Returns** `Promise<TransactionReceipt>` -- swap transaction receipt **in first blockchain**. Promise will be resolved, when swap transaction gets to block.

---

#### crossChainTrade.needApprove method

```typescript
crossChainTrade.needApprove(): Promise<boolean>
```


> ℹ️️ You have to set up **rpc provider 🌐** for trade network for which you will call needApprove.

Swap method will automatically call approve if needed, but you can use methods pair `needApprove`-`approve`
if you want to know if approve is needed before execute swap to show user double button, or swap stages in UI.

**crossChainTrade.needApprove Returns** `Promise<boolean>` -- True if approve is required, that is user doesn't have enough allowance. Otherwise, false.

---

#### crossChainTrade.approve method

```typescript
crossChainTrade.approve(options?: BasicTransactionOptions): Promise<TransactionReceipt>
```

> ℹ️️ You have to set up **wallet provider 👛** for network in which you will execute trade swap.

Use `approve` if you want to show swap stages in UI after allowance check via `needApprove` method.

**crossChainTrade.approve method parameters:**

| Parameter | Type                      | Description                     |
|-----------|---------------------------|---------------------------------|
| options   | `BasicTransactionOptions` | Additional transaction options. |

**BasicTransactionOptions description:**

| Option             | Type                     | Description                                                                                                                 | Default                                                                                                                                |
|--------------------|--------------------------|-----------------------------------------------------------------------------------------------------------------------------|----------------------------------------------------------------------------------------------------------------------------------------|
| onTransactionHash? | `(hash: string) => void` | Callback that will be called after the user signs the approve transaction.                                                  |
| gasPrice?          | `string`                 | Specifies gas price **in wei** for **approve** transaction. Set this parameter only if you know exactly what you are doing. | The value obtained during the calculation of the trade. If value wasn't calculated, it will calculates automatically by user's wallet. |
| gasLimit?          | `string`                 | Specifies gas limit for **approve** transactions. Set this parameter only if you know exactly what you are doing.           | The value obtained during the calculation of the trade. If value wasn't calculated, it will calculates automatically by user's wallet. |

**Returns** `Promise<TransactionReceipt>` -- approve transaction receipt. Promise will be resolved, when swap transaction gets to block.

---

#### crossChainTrade.from readonly field

```typescript
readonly crossChainTrade.from: PriceTokenAmount
```

Token to sell with price in USD per 1 token unit and selling amount.

---

#### crossChainTrade.to readonly field

```typescript
readonly crossChainTrade.to: PriceTokenAmount
```

Token to buy with price in USD per 1 token unit and estimated output amount.

---

#### crossChainTrade.toTokenAmountMin readonly field

```typescript
readonly crossChainTrade.to: PriceTokenAmount
```

Is same as `crossChainTrade.to`, but amount less than `crossChainTrade.to` by `(toSlippageTolerance * 100)` percent.

---

#### crossChainTrade.estimatedGas getter

```typescript
crossChainTrade.estimateGas(): GasFeeInfo | null
```

Gets gasFee, that is gasLimit * gasPrice. Equals `null` if gas couldn't be calculated.

---

#### crossChainTrade.priceImpactData getter

```typescript
crossChainTrade.priceImpactData(): {
  priceImpactFrom: number | null;
  priceImpactTo: number | null;
}
```

Returns price impact in first and second blockchains, based on tokens usd prices, taken from coingecko api.

---

### Tokens Manager

#### tokensManager.createTokenFromStruct method
```typescript
tokensManager.createTokenFromStruct(tokenStruct: TokenStruct): Token
```

Creates `Token` instance by full token data struct.

---

#### tokensManager.createToken method
```typescript
tokensManager.createToken(tokenBaseStruct: TokenBaseStruct): Promise<Token>
```

Fetches token data and creates `Token` by token address and token blockchain. 

---

#### tokensManager.createTokensFromStructs method
```typescript
tokensManager.createTokensFromStructs(tokensStructs: TokenStruct[]): Token[]
```

Same as `tokensManager.createTokenFromStruct` for multiple token structs.

---

#### tokensManager.createTokens method
```typescript
tokensManager.createTokens(addresses: string[], blockchain: BLOCKCHAIN_NAME): Promise<Token[]>
```

Same as `tokensManager.createToken` for multiple token structs. But using multicall for data fetching, so makes only one rpc request.
Use this method to crate tokens list instead of `Promise.all` and `tokensManager.createToken`.

---

#### tokensManager.createPriceTokenFromStruct method
```typescript
tokensManager.createPriceTokenFromStruct(priceTokenStruct: PriceTokenStruct): PriceToken
```

Creates price token from full price token struct including price.

---

#### tokensManager.createPriceToken method
```typescript
tokensManager.createPriceToken(token: TokenBaseStruct | TokenStruct): Promise<PriceToken>
```

Creates price token from full token struct (without price) or from token address and blockchain.

---

#### tokensManager.createPriceTokenAmountFromStruct method
```typescript
tokensManager.createPriceTokenAmountFromStruct(priceTokenAmountStruct: PriceTokenAmountStruct): PriceTokenAmount
```

Creates price token amount from full price token amount struct.

---

#### tokensManager.createPriceTokenAmount method
```typescript
tokensManager.createPriceTokenAmount(
    priceTokenAmountStruct:
      | PriceTokenAmountBaseStruct
      | (TokenStruct & ({ weiAmount: BigNumber } | { tokenAmount: BigNumber }))
): Promise<PriceTokenAmount>
```

Creates price token amount from token struct (without price) and amount or from token address, blockchain and amount.

---

### Token

#### token fields
```typescript
readonly blockchain: BLOCKCHAIN_NAME;

readonly address: string;

readonly name: string;

readonly symbol: string;

readonly decimals: number;
```

---

#### token.isNative method
Use `token.isNative` to detect native coins like ETH, BNB, MATIC, ... instead of comparing token address with 0x000...0.

---

#### token.isEqualTo method
```typescript
token.isEqualTo(token: TokenBaseStruct): boolean
```
Use it to check that two tokens have equal blockchains and addresses (in any case: lower/upper/mixed).
Token is TokenBaseStruct so you can pass Token instance to `token.isEqualTo`.

---

#### token.clone method
```typescript
token.clone(replaceStruct?: Partial<TokenStruct>): Token
```

Use it to deep clone token object and replace some properties.

---

### PriceToken 
Extends `Token`.

#### priceToken.price getter
Returns last set token price as `BigNumber`.

---

#### priceToken.asStruct getter
Serializes priceToken and its price to struct object.

---

#### priceToken.getAndUpdateTokenPrice method
```typescript
priceToken.getAndUpdateTokenPrice(): Promise<BigNumber>
```

Fetches current token price and saves it into token.

---

#### priceToken.cloneAndCreate
```typescript
priceToken.cloneAndCreate(tokenStruct?: Partial<PriceTokenStruct>): Promise<PriceToken>
```

Same as `token.clone` but fetches new price for new `PriceToken`.

---

### PriceTokenAmount
Extends `PriceToken`.

#### priceTokenAmount.weiAmount getter
Returns saved token amount in wei as `BigNumber` (weiAmount = tokenAmount * (10 ** token.decimals)).

---

#### priceTokenAmount.stringWeiAmount getter
Returns saved token amount in wei as string.

---

#### priceTokenAmount.tokenAmount getter
Returns saved token amount in human-readable token units as `BigNumber` (tokenAmount = weiAmount / (10 ** token.decimals)).

---

#### priceTokenAmount.weiAmountMinusSlippage method
```typescript
priceTokenAmount.weiAmountMinusSlippage(slippage: number): BigNumber
```

Returns wei amount decreased by (1 - slippage) times. Slippage is in range from 0 to 1. 

---

#### priceTokenAmount.weiAmountPlusSlippage method
```typescript
priceTokenAmount.weiAmountPlusSlippage(slippage: number): BigNumber
```

Returns wei amount increased by (1 - slippage) times. Slippage is in range from 0 to 1. 

---

#### priceTokenAmount.calculatePriceImpactPercent method
```typescript
calculatePriceImpactPercent(toToken: PriceTokenAmount): number | null
```

Calculates trade price impact percent if instance token is selling token, and parameter is buying token.
If selling usd amount is less than buying usd amount, returns 0.

