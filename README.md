# Rubic SDK

## API Documentation

[Latest API Documentation](https://cryptorubic.github.io/rubic-sdk)

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
        "crypto": require.resolve("crypto-browserify"),
        "zlib": require.resolve('browserify-zlib')
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
      global?: unknown;
    }
   
   (window as AppWindow).global = window;
   (window as AppWindow).process = window.process || require('process');
   (window as AppWindow).Buffer = (window as any).Buffer || require('buffer').Buffer;
   ```

## Trades usage

### Get started after cdn installation
```html
 <script>
        // you have to declare rpc links only for networks you will use
        const configuration = {
            rpcProviders: {
                ETH: {
                    rpcList: ['<your ethereum rpc>']
                },
                BSC: {
                    rpcList: ['<your bsc rpc>']
                },
                ...
                TRON: {
                    rpcList: [
                      {
                        fullHost: '<tron-api>',
                        headers: { "TRON-PRO-API-KEY": 'your api key' }
                      }
                    ]
                }
            },
            // if you are whitelisted integrator, provide your wallet address here
           providerAddress: {
              [CHAIN_TYPE.EVM]: {
                 crossChain: '0x0000000000000000000000000000000000000000', // Address for cross chain fee
                 onChain: '0x0000000000000000000000000000000000000000' // Address for on chain fee
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
            const trades = await sdk.onChainManager
                .calculateTrade({blockchain, address: fromTokenAddress}, fromAmount, toTokenAddress);
            
            console.log(trades);
        }
        main();
    </script>
```


### Get started after npm installation
1. Create configuration
    ```typescript
    import { Configuration, BLOCKCHAIN_NAME } from 'rubic-sdk';
    
    // you have to declare rpc links only for networks you will use
    export const configuration: Configuration = {
        rpcProviders: {
            [BLOCKCHAIN_NAME.ETHEREUM]: {
                rpcList: ['<your ethereum rpc #1>', '<your ethereum rpc #2>', ...]
            },
            [BLOCKCHAIN_NAME.BINANCE_SMART_CHAIN]: {
                rpcList: ['<your bsc rpc>']
            },
            ...
            [BLOCKCHAIN_NAME.TRON]: {
                rpcList: [
                    {
                        fullHost: '<tron api>',
                        headers: { "TRON-PRO-API-KEY": 'your api key' }
                    }
                ]
            }
        },
        // if you are whitelisted integrator, provide your wallet address here
        providerAddress: {
              [CHAIN_TYPE.EVM]: {
                 crossChain: '0x0000000000000000000000000000000000000000', // Address for cross chain fee
                 onChain: '0x0000000000000000000000000000000000000000' // Address for on chain fee
              }
        }
    }
    ```
2. Create sdk instance
    ```typescript
    import { SDK } from 'rubic-sdk';
   
    const sdk = await SDK.createSDK(configuration);
    ```

3. Use sdk instance for trade calculation
    ```typescript
    import { BLOCKCHAIN_NAME, TradeType, OnChainTrade, EvmOnChainTrade } from 'rubic-sdk';

    const blockchain = BLOCKCHAIN_NAME.ETHEREUM;
    const fromTokenAddress = '0x0000000000000000000000000000000000000000'; // ETH
    const fromAmount = 1;
    const toTokenAddress = '0xdac17f958d2ee523a2206206994597c13d831ec7'; // USDT

    const trades = await sdk.onChainManager.calculateTrade(
        { blockchain, address: fromTokenAddress }, 
        fromAmount,
        toTokenAddress
    );
    const bestTrade = trades[0];

    trades.forEach(trade => {
        const tradeType: TradeType = trade.type;
        console.log(`trade type: ${tradeType}`);

        if (trade instanceof OnChainTrade) {
            console.log(`to amount: ${trade.to.tokenAmount.toFormat(3)}`);
        } else {
           console.log(`error: ${trade.error}`);
        }
        
        // explore trades info
        if (trade instanceof EvmOnChainTrade) {
            console.log(`Gas fee: ${bestTrade.gasFeeInfo}`);
        }
        ...
    });
    ```

4. When user connects wallet (e.g. MetaMask) you should change configuration to use trade `swap` method.<br />
   **⚠️ Recalculate trades after this**.
    ```typescript
    import { WalletProvider, CHAIN_TYPE, Configuration } from 'rubic-sdk';
   
    const walletProvider: WalletProvider = {
        [CHAIN_TYPE.EVM]: {
            address: '0x123...', // user wallet address
            core: window.ethereum
        },
        [CHAIN_TYPE.TRON]: {
            address: 'T123...', // user wallet address
            core: window.tronLink.tronWeb // or window.tronWeb
        }
    };
   
    // initial configuration example
    const configuration: Configuration = {
        ...
        walletProvider
    }
    const sdk = await SDK.createSDK(configuration);
   
    // after user's wallet address changed
    // Example #1: 
    sdk.updateWalletProvider(walletProvider);
   
    // Example #2:
    sdk.updateWalletAddress(CHAIN_TYPE.EVM, address);

    ```

5. Now you can use `swap` method of trade instance. Approve transaction will be sent automatically if needed.
    ```typescript
    const onConfirm = (hash: string) => console.log(hash);

    // check that trade is defined
    сonst bestTrade = trades[0];
    const receipt = await bestTrade.swap({ onConfirm });
    ```

### Get started with cross-chain swaps
Steps 1. and 2. are the same. You can use single sdk instance for on-chain trades and cross-chain swaps calculations.

3. Use sdk instance for trade calculation
    ```typescript
    import { BLOCKCHAIN_NAME } from 'rubic-sdk';
    
    const fromBlockchain = BLOCKCHAIN_NAME.ETHEREUM;
    const fromTokenAddress = '0x0000000000000000000000000000000000000000'; // ETH
    const fromAmount = 1;
    const toBlockchain = BLOCKCHAIN_NAME.BINANCE_SMART_CHAIN;
    const toTokenAddress = '0xe9e7cea3dedca5984780bafc599bd69add087d56'; // BUSD
    
    const wrappedTrades = await sdk.crossChainManager.calculateTrade(
        { blockchain: fromBlockchain, address: fromTokenAddress }, 
        fromAmount,
        { blockchain: toBlockchain, address: toTokenAddress }
    );
   
    wrappedTrades.forEach(wrappedTrade => {
        const tradeType: TradeType = wrappedTrade.type;
        console.log(`trade type: ${tradeType}`);
        
        if (wrappedTrade.error) {
            console.log(`error: ${wrappedTrade.error}`);
        } else {
            const trade = wrappedTrade.trade!;
            console.log(`to amount: ${trade.to.tokenAmount.toFormat(3)}`);
   
            // explore trades info
            if (trade instanceof EvmCrossChainTrade) {
                console.log(trade.gasData)
            }
            ...
        }
    }) 
    ```

4. Same as in on-chain.

5. Now you can use `swap` method of trade instance. Approve transaction will be sent automatically if needed.
    ```typescript
    const onConfirm = (hash: string) => console.log(hash);

    // check, that trade is defined
    const bestTrade = wrappedTrades[0].trade;
    const receipt = await bestTrade.swap({ onConfirm });
    ```

## Token classes

You can use specific sdk `Token` classes to work with tokens.

### Token

```typescript
import { BLOCKCHAIN_NAME } from 'rubic-sdk';

const token: Token = await Token.createToken({ 
    blockchain: BLOCKCHAIN_NAME.ETHEREUM,
    address: '0xdac17f958d2ee523a2206206994597c13d831ec7'
});

console.log(token.symbol); // USDT
console.log(token.name); // Tether USD
console.log(token.decimals); // 6
```

You can also use constructor directly.
```typescript
import { BLOCKCHAIN_NAME } from 'rubic-sdk';

const token = new Token({
   blockchain: BLOCKCHAIN_NAME.ETHEREUM,
   address: '0xdac17f958d2ee523a2206206994597c13d831ec7',
   name: 'USD Coin',
   symbol: 'USDC',
   decimals: 6
})
```

### PriceToken

```typescript
import { BLOCKCHAIN_NAME } from 'rubic-sdk';

const token: PriceToken = await PriceToken.createToken({ 
    blockchain: BLOCKCHAIN_NAME.ETHEREUM,
    address: '0xdac17f958d2ee523a2206206994597c13d831ec7'
});

console.log(token.price);
```

### PriceTokenAmount

```typescript
import { BLOCKCHAIN_NAME } from 'rubic-sdk';

const token: PriceTokenAmount = await PriceTokenAmount.createToken({ 
    blockchain: BLOCKCHAIN_NAME.ETHEREUM,
    address: '0xdac17f958d2ee523a2206206994597c13d831ec7',
    tokenAmount: new BigNumber(1)
});

console.log(token.weiAmount);
```
