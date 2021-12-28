# Rubic SDK

> ⚠️ **Danger:** Rubik SDK is at the alpha stage. Don't use it in production code. Use rubik sdk at your own risk. During the first quarter of 2022, a beta release is planned, in which many interfaces and types can be changed. For now, you can explore our solution and try it out in a test environment. [An example of using rubik sdk](https://github.com/Cryptorubic/rubic-sdk-usage)

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

### Multi-chain swaps supported blockchains
Ethereum, Binance Smart Chain, Polygon, Avalanche, Fantom, Moonriver

## Installation
### Installation with cdn
```html
<script src="https://unpkg.com/web3@latest/dist/rubic-sdk.min.js"></script>
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

### Installation with npm and Angular
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
    Object.values(trades).forEach(([tradeType, trade]) =>
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


---

### Instant Trades Manager 

#### sdk.instantTrades.calculateTrade method

```typescript
sdk.instantTradescalculateTrade(
        fromToken:
            | Token
            | {
                  address: string;
                  blockchain: BLOCKCHAIN_NAME;
              },
        fromAmount: string | number,
        toToken: Token | string,
        options?: SwapManagerCalculationOptions
    ): Promise<TypedTrades>
```

> ℹ️️ You have to set up **rpc provider 🌐** for network in which you will calculate trade.

Method calculates instant trades parameters and estimated output amount.

**sdk.instantTrades.calculateTrade method parameters:**

| Parameter  | Type                                                           | Description                                                                                                                 |
|------------|----------------------------------------------------------------|-----------------------------------------------------------------------------------------------------------------------------|
| fromToken  | `Token`  or `{ address: string; blockchain: BLOCKCHAIN_NAME;}` | Token sell.                                                                                                                 |
| fromAmount | `string` or `number`                                           | Amount in token units (**not in wei!**) to swap.                                                                            |
| toToken    | `Token` or `string`                                            | Token to get. You can pass Token object, or string token address. Must has same blockchain as fromToken if passed as Token. |
| options?   | `SwapManagerCalculationOptions`                                | Swap calculation options.                                                                                                   |

**SwapManagerCalculationOptions description:**

| Option             | Type                                                   | Description                                                                                                                                                                                                          | Default     |
|--------------------|--------------------------------------------------------|----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|-------------|
| timeout?           | `number`                                               | Specify trade calculation timeout in ms (same timeout for every provider separately).                                                                                                                                | 3000        |
| disabledProviders? | `TradeType[]`                                          | Specify providers which must be ignored.                                                                                                                                                                             | []          |
| gasCalculation?    | `'disabled'` or `'calculate'` or `'rubicOptimisation'` | Disable estimated gas calculation, or use rubic gas optimisation to consider the gas fee when calculating route profit (works only for UniswapV2-like and UniswapV3-like providers.).                                | 'calculate' |
| disableMultihops?  | `boolean`                                              | Disable not direct swap routes. It can help to reduce gas fee, but can worsen the exchange rate. Better use `gasCalculation = 'rubicOptiomisation'` when it is possible.                                             | false       |
| slippageTolerance? | `number`                                               | Swap slippage in range 0 to 1. Defines minimum amount that you can get after swap. Can be changed after trade calculation for every trade separately (excluding 0x trade).                                           | 0.02        |
| deadlineMinutes?   | `number`                                               | Transaction deadline in minutes (countdown from the transaction sending date). Will be applied only for UniswapV2-like and UniswapV3-like trades. Can be changed after trade calculation for every trade separately. | 20          |

**Returns** `Promise<TypedTrades> = Promisr<Partial<Record<TradeType, InstantTrade>>>` -- mapping of successful calculated trades and their types. 

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

#### instantTrade.from readonly field

```typescript
readonly instantTrade.from: PriceTokenAmount
```

Token to sell with price in USD per 1 token unit and selling amount.

---

#### instantTrade.to readonly mutable field

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

### instantTrade.deadlineMinutes mutable field

```typescript
instantTrade.deadlineMinutes: number
```

> ⚠️ Is available only in uniswapV2-like and uniswapV3-like trades.

Transaction deadline in minutes (countdown from the transaction sending date). Can be changed: just modify deadlineMinutes field.

---

### instantTrade.path readonly field

```typescript
instantTrade.path: ReadonlyArray<Token>
```

> ⚠️ Is not available for 0x trades.

Swap path. E.g. if you change ETH to LINK path might be [ETH, USDT, LINK].
Path elements is `Token`, so you can get address, symbol and other properties of each element.
If you sell, or get native coin (like ETH, BNB, MATIC, ...) in swap, `path[0]` or `path[path.length -1]` **won't** be wrapped tokens like WETH, but will be native tokens. 

---

### Cross Chain Manager



---

### Cross Chain Trade


---

### Utils
