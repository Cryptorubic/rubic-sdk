"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.defaultPolygonProviderConfiguration = void 0;
var defaultPolygonRoutingProvidersAddresses = [
    '0x0d500B1d8E8eF31E21C99d1Db9A6444d3ADf1270',
    '0x7ceb23fd6bc0add59e62ac25578270cff1b9f619',
    '0x8f3Cf7ad23Cd3CaDbD9735AFf958023239c6A063',
    '0xc2132D05D31c914a87C6611C10748AEb04B58e8F',
    '0x2791bca1f2de4661ed88a30c99a7a9449aa84174',
    '0x831753DD7087CaC61aB5644b308642cc1c33Dc13' // QUICK
];
var defaultPolygonWethAddress = '0x0d500B1d8E8eF31E21C99d1Db9A6444d3ADf1270';
exports.defaultPolygonProviderConfiguration = {
    maxTransitTokens: 3,
    routingProvidersAddresses: defaultPolygonRoutingProvidersAddresses,
    wethAddress: defaultPolygonWethAddress
};
//# sourceMappingURL=default-constants.js.map