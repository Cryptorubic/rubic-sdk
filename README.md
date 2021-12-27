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

// TODO: add full api description
