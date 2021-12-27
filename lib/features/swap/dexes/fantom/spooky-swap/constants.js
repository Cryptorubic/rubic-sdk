"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SPOOKY_SWAP_PROVIDER_CONFIGURATION = exports.SPOOKY_SWAP_CONTRACT_ADDRESS = void 0;
var default_constants_1 = require("../default-constants");
exports.SPOOKY_SWAP_CONTRACT_ADDRESS = '0xF491e7B69E4244ad4002BC14e878a34207E38c29';
var routingProvidersAddresses = [
    '0x21be370D5312f44cB42ce377BC9b8a0cEF1A4C83',
    '0x5cc61a78f164885776aa610fb0fe1257df78e59b',
    '0x04068da6c83afcfa0e13ba15a6696662335d5b75',
    '0x049d68029688eAbF473097a2fC38ef61633A3C7A',
    '0x321162Cd933E2Be498Cd2267a90534A804051b11',
    '0x74b23882a30290451a17c44f4f05243b6b58c76d',
    '0x841fad6eae12c286d1fd18d1d525dffa75c7effe' // BOO
];
exports.SPOOKY_SWAP_PROVIDER_CONFIGURATION = __assign(__assign({}, default_constants_1.defaultFantomProviderConfiguration), { routingProvidersAddresses: routingProvidersAddresses });
//# sourceMappingURL=constants.js.map