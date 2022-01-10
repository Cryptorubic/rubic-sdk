"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.defaultFantomProviderConfiguration = void 0;
var defaultFantomRoutingProvidersAddresses = [
    '0x21be370D5312f44cB42ce377BC9b8a0cEF1A4C83',
    '0x5cc61a78f164885776aa610fb0fe1257df78e59b',
    '0x04068da6c83afcfa0e13ba15a6696662335d5b75',
    '0x049d68029688eAbF473097a2fC38ef61633A3C7A',
    '0x82f0b8b456c1a451378467398982d4834b6829c1',
    '0x321162Cd933E2Be498Cd2267a90534A804051b11',
    '0x74b23882a30290451a17c44f4f05243b6b58c76d' // wETH
];
var defaultFantomWethAddress = '0x21be370D5312f44cB42ce377BC9b8a0cEF1A4C83';
exports.defaultFantomProviderConfiguration = {
    maxTransitTokens: 2,
    routingProvidersAddresses: defaultFantomRoutingProvidersAddresses,
    wethAddress: defaultFantomWethAddress
};
//# sourceMappingURL=default-constants.js.map