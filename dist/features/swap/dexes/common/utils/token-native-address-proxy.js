"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createTokenNativeAddressProxy = void 0;
function createTokenNativeAddressProxy(token, wrappedNativeAddress) {
    var wethAbleAddress = token.isNative ? wrappedNativeAddress : token.address;
    return new Proxy(token, {
        get: function (target, key) {
            if (!(key in target)) {
                return undefined;
            }
            if (key === 'address') {
                return wethAbleAddress;
            }
            return target[key];
        }
    });
}
exports.createTokenNativeAddressProxy = createTokenNativeAddressProxy;
//# sourceMappingURL=token-native-address-proxy.js.map