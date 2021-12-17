"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.defaultHarmonyProviderConfiguration = void 0;
var defaultHarmonyRoutingProvidersAddresses = [
    '0xcf664087a5bb0237a0bad6742852ec6c8d69a27a',
    '0xef977d2f931c1978db5f6747666fa1eacb0d0339',
    '0x985458e523db3d53125813ed68c274899e9dfab4',
    '0x3c2b8be99c50593081eaa2a724f0b8285f5aba8f',
    '0x3095c7557bcb296ccc6e363de01b760ba031f2d9' // WBTC
];
var defaultHarmonyWethAddress = '0xcf664087a5bb0237a0bad6742852ec6c8d69a27a';
exports.defaultHarmonyProviderConfiguration = {
    maxTransitTokens: 2,
    routingProvidersAddresses: defaultHarmonyRoutingProvidersAddresses,
    wethAddress: defaultHarmonyWethAddress
};
//# sourceMappingURL=default-constants.js.map