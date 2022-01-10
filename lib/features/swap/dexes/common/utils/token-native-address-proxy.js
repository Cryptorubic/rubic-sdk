"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createTokenNativeAddressProxyInPathStartAndEnd = exports.createTokenNativeAddressProxy = void 0;
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
function createTokenNativeAddressProxyInPathStartAndEnd(path, wrappedNativeAddress) {
    return [createTokenNativeAddressProxy(path[0], wrappedNativeAddress)]
        .concat(path.slice(1, path.length - 1))
        .concat(createTokenNativeAddressProxy(path[path.length - 1], wrappedNativeAddress));
}
exports.createTokenNativeAddressProxyInPathStartAndEnd = createTokenNativeAddressProxyInPathStartAndEnd;
//# sourceMappingURL=token-native-address-proxy.js.map