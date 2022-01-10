"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.defaultEthereumProviderConfiguration = void 0;
var defaultEthereumRoutingProvidersAddresses = [
    '0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2',
    '0xdac17f958d2ee523a2206206994597c13d831ec7',
    '0x6b175474e89094c44da98b954eedeac495271d0f',
    '0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48' // USDC
];
var defaultEthereumWethAddress = '0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2';
exports.defaultEthereumProviderConfiguration = {
    maxTransitTokens: 1,
    routingProvidersAddresses: defaultEthereumRoutingProvidersAddresses,
    wethAddress: defaultEthereumWethAddress
};
//# sourceMappingURL=default-constants.js.map