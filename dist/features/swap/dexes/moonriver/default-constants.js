"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.defaultMoonriverProviderConfiguration = void 0;
var defaultMoonriverRoutingProvidersAddresses = [
    '0xf50225a84382c74cbdea10b0c176f71fc3de0c4d',
    '0xB44a9B6905aF7c801311e8F4E76932ee959c663C',
    '0xE3F5a90F9cb311505cd691a46596599aA1A0AD7D',
    '0x80A16016cC4A2E6a2CACA8a4a498b1699fF0f844',
    '0x5D9ab5522c64E1F6ef5e3627ECCc093f56167818' // BUSD
];
var defaultMoonriverWethAddress = '0xf50225a84382c74cbdea10b0c176f71fc3de0c4d';
exports.defaultMoonriverProviderConfiguration = {
    maxTransitTokens: 2,
    routingProvidersAddresses: defaultMoonriverRoutingProvidersAddresses,
    wethAddress: defaultMoonriverWethAddress
};
//# sourceMappingURL=default-constants.js.map